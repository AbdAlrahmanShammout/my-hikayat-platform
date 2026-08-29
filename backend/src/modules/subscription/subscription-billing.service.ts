import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { TransactionRunner } from '@/common/base/transaction-runner';
import { AppConfigService } from '@/config/app/app-config.service';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { REFUND_WINDOW } from '@/modules/subscription/consts/refund-window.constant';
import {
  CancelManagedSubscriptionServiceInput,
  ReceiveWebhookServiceInput,
  RefundManagedSubscriptionServiceInput,
  StartCheckoutResult,
  StartCheckoutServiceInput,
} from '@/modules/subscription/defs/subscription-billing.defs';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { PlanKind, SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { buildCheckoutReturnPage } from '@/modules/subscription/build-checkout-return-page.helper';
import { isCheckoutReturnUrlAllowed } from '@/modules/subscription/checkout-return-url.helper';
import { CheckoutReturnUrlInvalidException } from '@/modules/subscription/exceptions/checkout-return-url-invalid.exception';
import { RefundNotEligibleException } from '@/modules/subscription/exceptions/refund-not-eligible.exception';
import { RefundWindowExpiredException } from '@/modules/subscription/exceptions/refund-window-expired.exception';
import { SubscriptionAlreadyPaidException } from '@/modules/subscription/exceptions/subscription-already-paid.exception';
import { hasPaidReadingEntitlement } from '@/modules/subscription/has-paid-reading-entitlement.helper';
import { PlanService } from '@/modules/subscription/plan.service';
import { SubscriptionRepository } from '@/modules/subscription/repository/subscription.repository';
import { resolveStripeCheckoutReturnUrl } from '@/modules/subscription/resolve-stripe-checkout-return-url.helper';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserService } from '@/modules/user/user.service';
import {
  HandleCheckoutCompletedInput,
  HandleInvoicePaymentFailedInput,
  HandleSubscriptionCanceledInput,
  HandleSubscriptionRenewedInput,
} from '@/providers/stripe/defs/stripe-manager.defs';
import { StripeInvalidWebhookException } from '@/providers/stripe/exceptions/stripe-invalid-webhook.exception';
import { StripeManagerService } from '@/providers/stripe/stripe-manager.service';

@Injectable()
export class SubscriptionBillingService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly planService: PlanService,
    private readonly userService: UserService,
    private readonly stripeManagerService: StripeManagerService,
    private readonly appConfigService: AppConfigService,
    private readonly auditLogService: AuditLogService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async startCheckout(input: StartCheckoutServiceInput): Promise<StartCheckoutResult> {
    const user: UserEntity = await this.userService.getUserById(input.userId);
    this.assertCheckoutReturnUrl(input.successUrl);
    this.assertCheckoutReturnUrl(input.cancelUrl);
    const plan: PlanEntity = await this.planService.getPurchasablePlanById(input.planId);
    const stripePriceId: string = plan.stripePriceId as string;
    const subscription: SubscriptionEntity = await this.resolveCheckoutSubscription(user.id);
    if (hasPaidReadingEntitlement(subscription)) {
      throw new SubscriptionAlreadyPaidException();
    }
    const customerId: string = await this.resolveStripeCustomerId(user, subscription);
    const session = await this.stripeManagerService.createCheckoutSession({
      customerId,
      successUrl: resolveStripeCheckoutReturnUrl({
        clientReturnUrl: input.successUrl,
        bridgeOrigin: input.bridgeOrigin,
      }),
      cancelUrl: resolveStripeCheckoutReturnUrl({
        clientReturnUrl: input.cancelUrl,
        bridgeOrigin: input.bridgeOrigin,
      }),
      clientReferenceId: String(user.id),
      priceId: stripePriceId,
      metadata: { planId: String(plan.id) },
    });
    return { url: session.url };
  }

  renderCheckoutReturnPage(returnUrl: string): string {
    this.assertCheckoutReturnUrl(returnUrl);
    return buildCheckoutReturnPage(returnUrl);
  }

  async getCurrentSubscription(userId: number): Promise<SubscriptionEntity> {
    return this.subscriptionService.ensureFreeSubscription(userId);
  }

  async startTrial(userId: number): Promise<SubscriptionEntity> {
    return this.subscriptionService.startTrial(userId);
  }

  async requestRefund(userId: number): Promise<SubscriptionEntity> {
    const subscription: SubscriptionEntity =
      await this.subscriptionService.getSubscriptionByUserId(userId);
    return this.applyPaidRefundPolicy(subscription);
  }

  async refundManagedSubscription(
    input: RefundManagedSubscriptionServiceInput,
  ): Promise<SubscriptionEntity> {
    const subscription: SubscriptionEntity = await this.subscriptionService.getSubscriptionById(
      input.subscriptionId,
    );
    const refunded: SubscriptionEntity = await this.applyPaidRefundPolicy(subscription);
    await this.auditLogService.append({
      actorUserId: input.actorUserId,
      action: AuditAction.SUBSCRIPTION_CANCELED,
      subjectType: AuditSubjectType.SUBSCRIPTION,
      subjectId: refunded.id,
      metadata: {
        userId: refunded.userId,
        fromStatus: subscription.status,
        toStatus: refunded.status,
        hadStripeSubscription: true,
        refunded: true,
      },
    });
    return refunded;
  }

  async cancelManagedSubscription(
    input: CancelManagedSubscriptionServiceInput,
  ): Promise<SubscriptionEntity> {
    const subscription: SubscriptionEntity = await this.subscriptionService.getSubscriptionById(
      input.subscriptionId,
    );
    if (subscription.status === SubscriptionStatus.CANCELED) {
      return subscription;
    }
    if (subscription.stripeSubscriptionId !== null) {
      await this.stripeManagerService.cancelPaidSubscription({
        stripeSubscriptionId: subscription.stripeSubscriptionId,
      });
    }
    return this.transactionRunner.run(async (context: TransactionContext) => {
      const canceled: SubscriptionEntity = await this.subscriptionService.cancelSubscription(
        subscription.id,
        context,
      );
      await this.auditLogService.append(
        {
          actorUserId: input.actorUserId,
          action: AuditAction.SUBSCRIPTION_CANCELED,
          subjectType: AuditSubjectType.SUBSCRIPTION,
          subjectId: canceled.id,
          metadata: {
            userId: canceled.userId,
            fromStatus: subscription.status,
            toStatus: canceled.status,
            hadStripeSubscription: subscription.stripeSubscriptionId !== null,
          },
        },
        context,
      );
      return canceled;
    });
  }

  async applyCheckoutCompleted(input: HandleCheckoutCompletedInput): Promise<void> {
    const userId: number | null = SubscriptionBillingService.parseUserId(input.clientReferenceId);
    if (userId === null) {
      return;
    }
    const user: UserEntity | null = await this.userService.findUserById(userId);
    if (user === null) {
      return;
    }
    const subscription: SubscriptionEntity | null =
      await this.subscriptionService.findSubscriptionByUserId(userId);
    if (subscription === null) {
      return;
    }
    const planId: number | null = SubscriptionBillingService.parsePlanId(input.planId);
    if (planId === null) {
      return;
    }
    const plan: PlanEntity | null = await this.planService.findPlanById(planId);
    if (plan === null || plan.kind !== PlanKind.MONTHLY_PAID) {
      return;
    }
    const closedTrialEndsAt: Date | undefined =
      subscription.trialEndsAt !== null && subscription.trialEndsAt.getTime() > Date.now()
        ? new Date()
        : undefined;
    await this.subscriptionService.updateSubscription({
      id: subscription.id,
      planId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      stripeCustomerId: input.customerId,
      stripeSubscriptionId: input.subscriptionId,
      currentPeriodStart: input.currentPeriodStart,
      currentPeriodEnd: input.currentPeriodEnd,
      canceledAt: null,
      activatedAt: SubscriptionBillingService.resolveActivatedAt(subscription, input),
      ...(closedTrialEndsAt === undefined ? {} : { trialEndsAt: closedTrialEndsAt }),
    });
  }

  async applySubscriptionRenewed(input: HandleSubscriptionRenewedInput): Promise<void> {
    const subscription: SubscriptionEntity | null = await this.findSubscriptionByStripeIds({
      subscriptionId: input.subscriptionId,
      customerId: input.customerId,
    });
    if (subscription === null) {
      return;
    }
    await this.subscriptionService.updateSubscription({
      id: subscription.id,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: input.currentPeriodStart,
      currentPeriodEnd: input.currentPeriodEnd,
      canceledAt: null,
    });
  }

  async applySubscriptionCanceled(input: HandleSubscriptionCanceledInput): Promise<void> {
    const subscription: SubscriptionEntity | null = await this.findSubscriptionByStripeIds({
      subscriptionId: input.subscriptionId,
      customerId: input.customerId,
    });
    if (subscription === null) {
      return;
    }
    await this.subscriptionService.cancelSubscription(subscription.id);
    if (input.currentPeriodEnd === null) {
      return;
    }
    await this.subscriptionService.updateSubscription({
      id: subscription.id,
      currentPeriodEnd: input.currentPeriodEnd,
    });
  }

  async applyInvoicePaymentFailed(input: HandleInvoicePaymentFailedInput): Promise<void> {
    const subscription: SubscriptionEntity | null = await this.findSubscriptionByStripeIds({
      subscriptionId: input.subscriptionId,
      customerId: input.customerId,
    });
    if (subscription === null) {
      return;
    }
    await this.auditLogService.append({
      actorUserId: subscription.userId,
      action: AuditAction.SUBSCRIPTION_PAYMENT_FAILED,
      subjectType: AuditSubjectType.SUBSCRIPTION,
      subjectId: subscription.id,
      metadata: {
        stripeInvoiceId: input.invoiceId,
        stripeCustomerId: input.customerId,
        stripeSubscriptionId: input.subscriptionId,
        invoiceStatus: input.status,
      },
    });
  }

  async receiveWebhook(input: ReceiveWebhookServiceInput): Promise<void> {
    if (input.signature === undefined || input.signature === '' || input.payload === undefined) {
      throw new StripeInvalidWebhookException();
    }
    await this.stripeManagerService.processWebhook({
      payload: input.payload,
      signature: input.signature,
    });
  }

  private async resolveCheckoutSubscription(userId: number): Promise<SubscriptionEntity> {
    const existing: SubscriptionEntity | null =
      await this.subscriptionService.findSubscriptionByUserId(userId);
    if (existing !== null) {
      return existing;
    }
    return this.subscriptionService.ensureFreeSubscription(userId);
  }

  private async resolveStripeCustomerId(
    user: UserEntity,
    subscription: SubscriptionEntity,
  ): Promise<string> {
    if (subscription.stripeCustomerId !== null) {
      return subscription.stripeCustomerId;
    }
    const customer = await this.stripeManagerService.createCustomer({
      email: user.email,
      clientReferenceId: String(user.id),
    });
    await this.subscriptionService.updateSubscription({
      id: subscription.id,
      stripeCustomerId: customer.customerId,
    });
    return customer.customerId;
  }

  private async findSubscriptionByStripeIds(input: {
    readonly subscriptionId: string;
    readonly customerId: string | null;
  }): Promise<SubscriptionEntity | null> {
    const bySubscription: SubscriptionEntity | null =
      await this.subscriptionRepository.findByStripeSubscriptionId(input.subscriptionId);
    if (bySubscription !== null) {
      return bySubscription;
    }
    if (input.customerId === null) {
      return null;
    }
    return this.subscriptionRepository.findByStripeCustomerId(input.customerId);
  }

  private assertCheckoutReturnUrl(urlValue: string): void {
    if (isCheckoutReturnUrlAllowed(urlValue, this.appConfigService.checkoutReturnOrigins)) {
      return;
    }
    throw new CheckoutReturnUrlInvalidException();
  }

  private async applyPaidRefundPolicy(
    subscription: SubscriptionEntity,
  ): Promise<SubscriptionEntity> {
    const stripeSubscriptionId: string =
      SubscriptionBillingService.resolveRefundStripeSubscriptionId(subscription);
    await this.stripeManagerService.refundPaidSubscription({
      stripeSubscriptionId,
    });
    const canceled: SubscriptionEntity = await this.subscriptionService.cancelSubscription(
      subscription.id,
    );
    return this.subscriptionService.updateSubscription({
      id: canceled.id,
      currentPeriodEnd: new Date(),
    });
  }

  private static resolveRefundStripeSubscriptionId(subscription: SubscriptionEntity): string {
    if (
      !SubscriptionBillingService.isPaidMonthly(subscription) ||
      subscription.stripeSubscriptionId === null
    ) {
      throw new RefundNotEligibleException();
    }
    const activatedAt: Date | null = subscription.activatedAt ?? subscription.currentPeriodStart;
    if (activatedAt === null) {
      throw new RefundNotEligibleException();
    }
    if (SubscriptionBillingService.isRefundWindowExpired(activatedAt)) {
      throw new RefundWindowExpiredException();
    }
    return subscription.stripeSubscriptionId;
  }

  private static isPaidMonthly(subscription: SubscriptionEntity): boolean {
    return (
      subscription.status === SubscriptionStatus.ACTIVE &&
      subscription.plan?.kind === PlanKind.MONTHLY_PAID
    );
  }

  private static resolveActivatedAt(
    subscription: SubscriptionEntity,
    input: HandleCheckoutCompletedInput,
  ): Date {
    if (
      subscription.stripeSubscriptionId === input.subscriptionId &&
      subscription.activatedAt !== null
    ) {
      return subscription.activatedAt;
    }
    return input.currentPeriodStart ?? new Date();
  }

  private static isRefundWindowExpired(activatedAt: Date, now: Date = new Date()): boolean {
    const windowMs: number = REFUND_WINDOW.days * REFUND_WINDOW.millisecondsPerDay;
    return now.getTime() > activatedAt.getTime() + windowMs;
  }

  private static parseUserId(clientReferenceId: string): number | null {
    const userId: number = Number.parseInt(clientReferenceId, 10);
    if (!Number.isInteger(userId) || userId <= 0 || String(userId) !== clientReferenceId) {
      return null;
    }
    return userId;
  }

  private static parsePlanId(planId: string | null): number | null {
    if (planId === null) {
      return null;
    }
    const parsed: number = Number.parseInt(planId, 10);
    if (!Number.isInteger(parsed) || parsed <= 0 || String(parsed) !== planId) {
      return null;
    }
    return parsed;
  }
}
