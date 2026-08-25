import { AppConfigService } from '@/config/app/app-config.service';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { PLAN_SLUG } from '@/modules/subscription/consts/plan-slug.constant';
import { REFUND_WINDOW } from '@/modules/subscription/consts/refund-window.constant';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import {
  PlanInterval,
  PlanKind,
  SubscriptionStatus,
} from '@/modules/subscription/enum/general.enum';
import { CheckoutReturnUrlInvalidException } from '@/modules/subscription/exceptions/checkout-return-url-invalid.exception';
import { RefundNotEligibleException } from '@/modules/subscription/exceptions/refund-not-eligible.exception';
import { RefundWindowExpiredException } from '@/modules/subscription/exceptions/refund-window-expired.exception';
import { SubscriptionAlreadyPaidException } from '@/modules/subscription/exceptions/subscription-already-paid.exception';
import { PlanService } from '@/modules/subscription/plan.service';
import { SubscriptionRepository } from '@/modules/subscription/repository/subscription.repository';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserService } from '@/modules/user/user.service';
import { StripeInvalidWebhookException } from '@/providers/stripe/exceptions/stripe-invalid-webhook.exception';
import { StripeManagerService } from '@/providers/stripe/stripe-manager.service';

import { SubscriptionBillingService } from './subscription-billing.service';

function createSampleUser(): UserEntity {
  return new UserEntity({
    id: 5,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'reader@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.READER,
    isPublisher: false,
  });
}

function createSamplePlan(kind = PlanKind.FREE): PlanEntity {
  return new PlanEntity({
    id: kind === PlanKind.FREE ? 1 : 2,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    slug: kind === PlanKind.FREE ? 'free' : 'monthly',
    name: kind === PlanKind.FREE ? 'Free' : 'Monthly',
    kind,
    interval: kind === PlanKind.FREE ? null : PlanInterval.MONTH,
  });
}

function createSampleSubscription(
  kind = PlanKind.FREE,
  status = SubscriptionStatus.ACTIVE,
  currentPeriodEnd: Date | null = null,
): SubscriptionEntity {
  const plan = createSamplePlan(kind);
  return new SubscriptionEntity({
    id: 7,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 5,
    planId: plan.id,
    status,
    startedAt: new Date('2026-01-01T00:00:00.000Z'),
    currentPeriodStart: currentPeriodEnd,
    currentPeriodEnd,
    canceledAt: status === SubscriptionStatus.CANCELED ? new Date() : null,
    activatedAt: kind === PlanKind.MONTHLY_PAID ? new Date() : null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    plan,
  });
}

describe('SubscriptionBillingService', () => {
  let mockSubscriptionService: {
    findSubscriptionByUserId: jest.Mock;
    getSubscriptionByUserId: jest.Mock;
    getSubscriptionById: jest.Mock;
    ensureFreeSubscription: jest.Mock;
    updateSubscription: jest.Mock;
    cancelSubscription: jest.Mock;
  };
  let mockSubscriptionRepository: {
    findByStripeSubscriptionId: jest.Mock;
    findByStripeCustomerId: jest.Mock;
  };
  let mockPlanService: { getPlanBySlug: jest.Mock };
  let mockUserService: { getUserById: jest.Mock; findUserById: jest.Mock };
  let mockStripeManagerService: {
    createCustomer: jest.Mock;
    createCheckoutSession: jest.Mock;
    processWebhook: jest.Mock;
    refundPaidSubscription: jest.Mock;
    cancelPaidSubscription: jest.Mock;
  };
  let mockAppConfigService: { allowedOrigins: string[]; checkoutReturnOrigins: string[] };
  let mockAuditLogService: { append: jest.Mock };
  let mockTransactionRunner: { run: jest.Mock };
  let subscriptionBillingService: SubscriptionBillingService;

  beforeEach(() => {
    mockSubscriptionService = {
      findSubscriptionByUserId: jest.fn(),
      getSubscriptionByUserId: jest.fn(),
      getSubscriptionById: jest.fn(),
      ensureFreeSubscription: jest.fn(),
      updateSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
    };
    mockSubscriptionRepository = {
      findByStripeSubscriptionId: jest.fn(),
      findByStripeCustomerId: jest.fn(),
    };
    mockPlanService = { getPlanBySlug: jest.fn() };
    mockUserService = { getUserById: jest.fn(), findUserById: jest.fn() };
    mockStripeManagerService = {
      createCustomer: jest.fn(),
      createCheckoutSession: jest.fn(),
      processWebhook: jest.fn(),
      refundPaidSubscription: jest.fn(),
      cancelPaidSubscription: jest.fn(),
    };
    mockAppConfigService = {
      allowedOrigins: ['http://localhost:3000'],
      checkoutReturnOrigins: ['http://localhost:3000', 'reader://'],
    };
    mockAuditLogService = { append: jest.fn() };
    mockTransactionRunner = {
      run: jest.fn(async (work: (context: undefined) => Promise<unknown>) => work(undefined)),
    };
    subscriptionBillingService = new SubscriptionBillingService(
      mockSubscriptionService as unknown as SubscriptionService,
      mockSubscriptionRepository as unknown as SubscriptionRepository,
      mockPlanService as unknown as PlanService,
      mockUserService as unknown as UserService,
      mockStripeManagerService as unknown as StripeManagerService,
      mockAppConfigService as unknown as AppConfigService,
      mockAuditLogService as unknown as AuditLogService,
      mockTransactionRunner,
    );
  });

  describe('startCheckout', () => {
    it('creates a Stripe customer then returns a hosted checkout url', async () => {
      mockUserService.getUserById.mockResolvedValue(createSampleUser());
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription(),
      );
      mockStripeManagerService.createCustomer.mockResolvedValue({ customerId: 'cus_1' });
      mockSubscriptionService.updateSubscription.mockResolvedValue(createSampleSubscription());
      mockStripeManagerService.createCheckoutSession.mockResolvedValue({
        checkoutSessionId: 'cs_1',
        url: 'https://checkout.stripe.test/cs_1',
      });
      const actualResult = await subscriptionBillingService.startCheckout({
        userId: 5,
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      });
      expect(mockStripeManagerService.createCustomer).toHaveBeenCalledWith({
        email: 'reader@example.com',
        clientReferenceId: '5',
      });
      expect(mockStripeManagerService.createCheckoutSession).toHaveBeenCalledWith({
        customerId: 'cus_1',
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
        clientReferenceId: '5',
      });
      expect(actualResult).toEqual({ url: 'https://checkout.stripe.test/cs_1' });
    });

    it('rejects checkout when the user is already on an active monthly plan', async () => {
      mockUserService.getUserById.mockResolvedValue(createSampleUser());
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription(
          PlanKind.MONTHLY_PAID,
          SubscriptionStatus.ACTIVE,
          new Date(Date.now() + 24 * 60 * 60 * 1000),
        ),
      );
      await expect(
        subscriptionBillingService.startCheckout({
          userId: 5,
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel',
        }),
      ).rejects.toBeInstanceOf(SubscriptionAlreadyPaidException);
      expect(mockStripeManagerService.createCheckoutSession).not.toHaveBeenCalled();
    });

    it('rejects checkout when a canceled paid period is still open', async () => {
      mockUserService.getUserById.mockResolvedValue(createSampleUser());
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription(
          PlanKind.MONTHLY_PAID,
          SubscriptionStatus.CANCELED,
          new Date(Date.now() + 24 * 60 * 60 * 1000),
        ),
      );
      await expect(
        subscriptionBillingService.startCheckout({
          userId: 5,
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel',
        }),
      ).rejects.toBeInstanceOf(SubscriptionAlreadyPaidException);
      expect(mockStripeManagerService.createCheckoutSession).not.toHaveBeenCalled();
    });

    it('allows checkout when an active paid period has already ended', async () => {
      mockUserService.getUserById.mockResolvedValue(createSampleUser());
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription(
          PlanKind.MONTHLY_PAID,
          SubscriptionStatus.ACTIVE,
          new Date(Date.now() - 24 * 60 * 60 * 1000),
        ),
      );
      mockStripeManagerService.createCustomer.mockResolvedValue({ customerId: 'cus_1' });
      mockSubscriptionService.updateSubscription.mockResolvedValue(
        createSampleSubscription(PlanKind.MONTHLY_PAID),
      );
      mockStripeManagerService.createCheckoutSession.mockResolvedValue({
        checkoutSessionId: 'cs_1',
        url: 'https://checkout.stripe.test/cs_1',
      });
      const actualResult = await subscriptionBillingService.startCheckout({
        userId: 5,
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      });
      expect(actualResult).toEqual({ url: 'https://checkout.stripe.test/cs_1' });
    });

    it('allows checkout when a canceled paid period has already ended', async () => {
      mockUserService.getUserById.mockResolvedValue(createSampleUser());
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription(
          PlanKind.MONTHLY_PAID,
          SubscriptionStatus.CANCELED,
          new Date(Date.now() - 24 * 60 * 60 * 1000),
        ),
      );
      mockStripeManagerService.createCustomer.mockResolvedValue({ customerId: 'cus_1' });
      mockSubscriptionService.updateSubscription.mockResolvedValue(
        createSampleSubscription(PlanKind.MONTHLY_PAID, SubscriptionStatus.CANCELED),
      );
      mockStripeManagerService.createCheckoutSession.mockResolvedValue({
        checkoutSessionId: 'cs_1',
        url: 'https://checkout.stripe.test/cs_1',
      });
      const actualResult = await subscriptionBillingService.startCheckout({
        userId: 5,
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      });
      expect(actualResult).toEqual({ url: 'https://checkout.stripe.test/cs_1' });
    });

    it('rejects a return URL outside the allowed origins', async () => {
      mockUserService.getUserById.mockResolvedValue(createSampleUser());
      await expect(
        subscriptionBillingService.startCheckout({
          userId: 5,
          successUrl: 'https://evil.test/success',
          cancelUrl: 'http://localhost:3000/cancel',
        }),
      ).rejects.toBeInstanceOf(CheckoutReturnUrlInvalidException);
    });

    it('allows reader deep-link return URLs from the checkout allowlist', async () => {
      mockUserService.getUserById.mockResolvedValue(createSampleUser());
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription(),
      );
      mockStripeManagerService.createCustomer.mockResolvedValue({ customerId: 'cus_1' });
      mockSubscriptionService.updateSubscription.mockResolvedValue(createSampleSubscription());
      mockStripeManagerService.createCheckoutSession.mockResolvedValue({
        checkoutSessionId: 'cs_reader',
        url: 'https://checkout.stripe.test/cs_reader',
      });
      const actualResult = await subscriptionBillingService.startCheckout({
        userId: 5,
        successUrl: 'reader://billing/success',
        cancelUrl: 'reader://billing/cancel',
      });
      expect(actualResult).toEqual({ url: 'https://checkout.stripe.test/cs_reader' });
      expect(mockStripeManagerService.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          successUrl: 'reader://billing/success',
          cancelUrl: 'reader://billing/cancel',
        }),
      );
    });
  });

  describe('applyCheckoutCompleted', () => {
    it('upgrades the matching user to the monthly plan', async () => {
      mockUserService.findUserById.mockResolvedValue(createSampleUser());
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription(),
      );
      mockPlanService.getPlanBySlug.mockResolvedValue(createSamplePlan(PlanKind.MONTHLY_PAID));
      mockSubscriptionService.updateSubscription.mockResolvedValue(
        createSampleSubscription(PlanKind.MONTHLY_PAID),
      );
      await subscriptionBillingService.applyCheckoutCompleted({
        customerId: 'cus_1',
        subscriptionId: 'sub_1',
        clientReferenceId: '5',
        currentPeriodStart: new Date('2026-08-01T00:00:00.000Z'),
        currentPeriodEnd: new Date('2026-09-01T00:00:00.000Z'),
      });
      expect(mockPlanService.getPlanBySlug).toHaveBeenCalledWith(PLAN_SLUG.MONTHLY);
      expect(mockSubscriptionService.updateSubscription).toHaveBeenCalledWith({
        id: 7,
        planId: 2,
        status: SubscriptionStatus.ACTIVE,
        stripeCustomerId: 'cus_1',
        stripeSubscriptionId: 'sub_1',
        currentPeriodStart: new Date('2026-08-01T00:00:00.000Z'),
        currentPeriodEnd: new Date('2026-09-01T00:00:00.000Z'),
        canceledAt: null,
        activatedAt: new Date('2026-08-01T00:00:00.000Z'),
      });
    });

    it('no-ops when the client reference does not match a user', async () => {
      await subscriptionBillingService.applyCheckoutCompleted({
        customerId: 'cus_1',
        subscriptionId: 'sub_1',
        clientReferenceId: 'not-a-user',
        currentPeriodStart: null,
        currentPeriodEnd: null,
      });
      expect(mockUserService.findUserById).not.toHaveBeenCalled();
    });
  });

  describe('applySubscriptionCanceled', () => {
    it('cancels the local subscription when Stripe ids match', async () => {
      mockSubscriptionRepository.findByStripeSubscriptionId.mockResolvedValue(
        createSampleSubscription(PlanKind.MONTHLY_PAID),
      );
      mockSubscriptionService.cancelSubscription.mockResolvedValue(
        createSampleSubscription(PlanKind.MONTHLY_PAID, SubscriptionStatus.CANCELED),
      );
      await subscriptionBillingService.applySubscriptionCanceled({
        customerId: 'cus_1',
        subscriptionId: 'sub_1',
        currentPeriodEnd: null,
      });
      expect(mockSubscriptionService.cancelSubscription).toHaveBeenCalledWith(7);
    });

    it('no-ops when no local subscription matches the Stripe ids', async () => {
      mockSubscriptionRepository.findByStripeSubscriptionId.mockResolvedValue(null);
      mockSubscriptionRepository.findByStripeCustomerId.mockResolvedValue(null);
      await subscriptionBillingService.applySubscriptionCanceled({
        customerId: 'cus_missing',
        subscriptionId: 'sub_missing',
        currentPeriodEnd: null,
      });
      expect(mockSubscriptionService.cancelSubscription).not.toHaveBeenCalled();
    });
  });

  describe('applySubscriptionRenewed', () => {
    it('keeps a past_due Stripe subscription locally active and updates the period', async () => {
      mockSubscriptionRepository.findByStripeSubscriptionId.mockResolvedValue(
        createSampleSubscription(PlanKind.MONTHLY_PAID),
      );
      mockPlanService.getPlanBySlug.mockResolvedValue(createSamplePlan(PlanKind.MONTHLY_PAID));
      mockSubscriptionService.updateSubscription.mockResolvedValue(
        createSampleSubscription(PlanKind.MONTHLY_PAID),
      );
      await subscriptionBillingService.applySubscriptionRenewed({
        customerId: 'cus_1',
        subscriptionId: 'sub_1',
        currentPeriodStart: new Date('2026-08-01T00:00:00.000Z'),
        currentPeriodEnd: new Date('2026-09-01T00:00:00.000Z'),
        status: 'past_due',
      });
      expect(mockSubscriptionService.updateSubscription).toHaveBeenCalledWith({
        id: 7,
        planId: 2,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date('2026-08-01T00:00:00.000Z'),
        currentPeriodEnd: new Date('2026-09-01T00:00:00.000Z'),
        canceledAt: null,
      });
      expect(mockSubscriptionService.cancelSubscription).not.toHaveBeenCalled();
    });
  });

  describe('applyInvoicePaymentFailed', () => {
    it('records a payment failure without rewriting subscription status', async () => {
      const paidSubscription = createSampleSubscription(PlanKind.MONTHLY_PAID);
      paidSubscription.stripeSubscriptionId = 'sub_1';
      mockSubscriptionRepository.findByStripeSubscriptionId.mockResolvedValue(paidSubscription);
      mockAuditLogService.append.mockResolvedValue(undefined);
      await subscriptionBillingService.applyInvoicePaymentFailed({
        customerId: 'cus_1',
        subscriptionId: 'sub_1',
        invoiceId: 'in_1',
        status: 'open',
      });
      expect(mockAuditLogService.append).toHaveBeenCalledWith({
        actorUserId: 5,
        action: AuditAction.SUBSCRIPTION_PAYMENT_FAILED,
        subjectType: AuditSubjectType.SUBSCRIPTION,
        subjectId: 7,
        metadata: {
          stripeInvoiceId: 'in_1',
          stripeCustomerId: 'cus_1',
          stripeSubscriptionId: 'sub_1',
          invoiceStatus: 'open',
        },
      });
      expect(mockSubscriptionService.cancelSubscription).not.toHaveBeenCalled();
      expect(mockSubscriptionService.updateSubscription).not.toHaveBeenCalled();
    });

    it('no-ops when no local subscription matches the Stripe ids', async () => {
      mockSubscriptionRepository.findByStripeSubscriptionId.mockResolvedValue(null);
      mockSubscriptionRepository.findByStripeCustomerId.mockResolvedValue(null);
      await subscriptionBillingService.applyInvoicePaymentFailed({
        customerId: 'cus_missing',
        subscriptionId: 'sub_missing',
        invoiceId: 'in_1',
        status: 'open',
      });
      expect(mockAuditLogService.append).not.toHaveBeenCalled();
      expect(mockSubscriptionService.cancelSubscription).not.toHaveBeenCalled();
    });
  });

  describe('receiveWebhook', () => {
    it('rejects a missing signature or raw body', async () => {
      await expect(
        subscriptionBillingService.receiveWebhook({ payload: undefined, signature: 'sig' }),
      ).rejects.toBeInstanceOf(StripeInvalidWebhookException);
    });

    it('forwards a verified payload to the Stripe manager', async () => {
      mockStripeManagerService.processWebhook.mockResolvedValue(undefined);
      const payload = Buffer.from('{"id":"evt_1"}');
      await subscriptionBillingService.receiveWebhook({ payload, signature: 'sig' });
      expect(mockStripeManagerService.processWebhook).toHaveBeenCalledWith({
        payload,
        signature: 'sig',
      });
    });
  });

  describe('requestRefund', () => {
    it('refunds Stripe and cancels a paid subscription inside the window', async () => {
      const expectedPeriodEnd = new Date('2026-08-16T12:00:00.000Z');
      jest.useFakeTimers();
      jest.setSystemTime(expectedPeriodEnd);
      const paidSubscription = createSampleSubscription(PlanKind.MONTHLY_PAID);
      paidSubscription.stripeSubscriptionId = 'sub_1';
      mockSubscriptionService.getSubscriptionByUserId.mockResolvedValue(paidSubscription);
      mockStripeManagerService.refundPaidSubscription.mockResolvedValue({ refundId: 're_1' });
      mockSubscriptionService.cancelSubscription.mockResolvedValue(
        createSampleSubscription(PlanKind.MONTHLY_PAID, SubscriptionStatus.CANCELED),
      );
      try {
        await subscriptionBillingService.requestRefund(5);
        expect(mockStripeManagerService.refundPaidSubscription).toHaveBeenCalledWith({
          stripeSubscriptionId: 'sub_1',
        });
        expect(mockSubscriptionService.cancelSubscription).toHaveBeenCalledWith(7);
        expect(mockSubscriptionService.updateSubscription).toHaveBeenCalledWith({
          id: 7,
          currentPeriodEnd: expectedPeriodEnd,
        });
      } finally {
        jest.useRealTimers();
      }
    });

    it('rejects a refund for a free subscription', async () => {
      mockSubscriptionService.getSubscriptionByUserId.mockResolvedValue(createSampleSubscription());
      await expect(subscriptionBillingService.requestRefund(5)).rejects.toBeInstanceOf(
        RefundNotEligibleException,
      );
    });

    it('rejects a refund after the seven-day window', async () => {
      const paidSubscription = createSampleSubscription(PlanKind.MONTHLY_PAID);
      paidSubscription.stripeSubscriptionId = 'sub_1';
      paidSubscription.activatedAt = new Date(
        Date.now() - (REFUND_WINDOW.days + 1) * REFUND_WINDOW.millisecondsPerDay,
      );
      mockSubscriptionService.getSubscriptionByUserId.mockResolvedValue(paidSubscription);
      await expect(subscriptionBillingService.requestRefund(5)).rejects.toBeInstanceOf(
        RefundWindowExpiredException,
      );
    });
  });

  describe('refundManagedSubscription', () => {
    it('applies the same 7-day refund policy and records an admin audit entry', async () => {
      const expectedPeriodEnd = new Date('2026-08-16T12:00:00.000Z');
      jest.useFakeTimers();
      jest.setSystemTime(expectedPeriodEnd);
      const paidSubscription = createSampleSubscription(PlanKind.MONTHLY_PAID);
      paidSubscription.stripeSubscriptionId = 'sub_1';
      const canceled = createSampleSubscription(PlanKind.MONTHLY_PAID, SubscriptionStatus.CANCELED);
      mockSubscriptionService.getSubscriptionById.mockResolvedValue(paidSubscription);
      mockStripeManagerService.refundPaidSubscription.mockResolvedValue({ refundId: 're_1' });
      mockSubscriptionService.cancelSubscription.mockResolvedValue(canceled);
      mockSubscriptionService.updateSubscription.mockResolvedValue(
        new SubscriptionEntity({
          ...canceled,
          currentPeriodEnd: expectedPeriodEnd,
        }),
      );
      try {
        const actualSubscription = await subscriptionBillingService.refundManagedSubscription({
          subscriptionId: 7,
          actorUserId: 9,
        });
        expect(mockStripeManagerService.refundPaidSubscription).toHaveBeenCalledWith({
          stripeSubscriptionId: 'sub_1',
        });
        expect(mockSubscriptionService.cancelSubscription).toHaveBeenCalledWith(7);
        expect(mockSubscriptionService.updateSubscription).toHaveBeenCalledWith({
          id: 7,
          currentPeriodEnd: expectedPeriodEnd,
        });
        expect(mockAuditLogService.append).toHaveBeenCalledWith({
          actorUserId: 9,
          action: AuditAction.SUBSCRIPTION_CANCELED,
          subjectType: AuditSubjectType.SUBSCRIPTION,
          subjectId: 7,
          metadata: {
            userId: 5,
            fromStatus: SubscriptionStatus.ACTIVE,
            toStatus: SubscriptionStatus.CANCELED,
            hadStripeSubscription: true,
            refunded: true,
          },
        });
        expect(actualSubscription.currentPeriodEnd).toEqual(expectedPeriodEnd);
      } finally {
        jest.useRealTimers();
      }
    });

    it('rejects an admin refund for a free subscription', async () => {
      mockSubscriptionService.getSubscriptionById.mockResolvedValue(createSampleSubscription());
      await expect(
        subscriptionBillingService.refundManagedSubscription({
          subscriptionId: 7,
          actorUserId: 9,
        }),
      ).rejects.toBeInstanceOf(RefundNotEligibleException);
      expect(mockStripeManagerService.refundPaidSubscription).not.toHaveBeenCalled();
      expect(mockAuditLogService.append).not.toHaveBeenCalled();
    });

    it('rejects an admin refund after the seven-day window', async () => {
      const paidSubscription = createSampleSubscription(PlanKind.MONTHLY_PAID);
      paidSubscription.stripeSubscriptionId = 'sub_1';
      paidSubscription.activatedAt = new Date(
        Date.now() - (REFUND_WINDOW.days + 1) * REFUND_WINDOW.millisecondsPerDay,
      );
      mockSubscriptionService.getSubscriptionById.mockResolvedValue(paidSubscription);
      await expect(
        subscriptionBillingService.refundManagedSubscription({
          subscriptionId: 7,
          actorUserId: 9,
        }),
      ).rejects.toBeInstanceOf(RefundWindowExpiredException);
      expect(mockStripeManagerService.refundPaidSubscription).not.toHaveBeenCalled();
    });
  });

  describe('cancelManagedSubscription', () => {
    it('cancels Stripe then records an admin audit entry', async () => {
      const paidSubscription = createSampleSubscription(PlanKind.MONTHLY_PAID);
      paidSubscription.stripeSubscriptionId = 'sub_1';
      const canceled = createSampleSubscription(PlanKind.MONTHLY_PAID, SubscriptionStatus.CANCELED);
      mockSubscriptionService.getSubscriptionById.mockResolvedValue(paidSubscription);
      mockStripeManagerService.cancelPaidSubscription.mockResolvedValue(undefined);
      mockSubscriptionService.cancelSubscription.mockResolvedValue(canceled);
      const actualSubscription = await subscriptionBillingService.cancelManagedSubscription({
        subscriptionId: 7,
        actorUserId: 9,
      });
      expect(mockStripeManagerService.cancelPaidSubscription).toHaveBeenCalledWith({
        stripeSubscriptionId: 'sub_1',
      });
      expect(mockSubscriptionService.cancelSubscription).toHaveBeenCalledWith(7, undefined);
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        {
          actorUserId: 9,
          action: AuditAction.SUBSCRIPTION_CANCELED,
          subjectType: AuditSubjectType.SUBSCRIPTION,
          subjectId: 7,
          metadata: {
            userId: 5,
            fromStatus: SubscriptionStatus.ACTIVE,
            toStatus: SubscriptionStatus.CANCELED,
            hadStripeSubscription: true,
          },
        },
        undefined,
      );
      expect(actualSubscription).toBe(canceled);
    });

    it('skips Stripe when the subscription has no Stripe id', async () => {
      mockSubscriptionService.getSubscriptionById.mockResolvedValue(createSampleSubscription());
      mockSubscriptionService.cancelSubscription.mockResolvedValue(
        createSampleSubscription(PlanKind.FREE, SubscriptionStatus.CANCELED),
      );
      await subscriptionBillingService.cancelManagedSubscription({
        subscriptionId: 7,
        actorUserId: 9,
      });
      expect(mockStripeManagerService.cancelPaidSubscription).not.toHaveBeenCalled();
      expect(mockSubscriptionService.cancelSubscription).toHaveBeenCalledWith(7, undefined);
    });

    it('does not write when the subscription is already canceled', async () => {
      const canceled = createSampleSubscription(PlanKind.MONTHLY_PAID, SubscriptionStatus.CANCELED);
      canceled.stripeSubscriptionId = 'sub_1';
      mockSubscriptionService.getSubscriptionById.mockResolvedValue(canceled);
      const actualSubscription = await subscriptionBillingService.cancelManagedSubscription({
        subscriptionId: 7,
        actorUserId: 9,
      });
      expect(mockStripeManagerService.cancelPaidSubscription).not.toHaveBeenCalled();
      expect(mockSubscriptionService.cancelSubscription).not.toHaveBeenCalled();
      expect(mockAuditLogService.append).not.toHaveBeenCalled();
      expect(actualSubscription).toBe(canceled);
    });
  });
});
