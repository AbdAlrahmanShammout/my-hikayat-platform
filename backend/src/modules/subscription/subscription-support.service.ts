import { Injectable } from '@nestjs/common';

import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import {
  isTrialEligible,
  ReadingAccessState,
  resolveReadingAccessState,
} from '@/modules/subscription/resolve-reading-access-state.helper';
import {
  RefundEligibility,
  resolveRefundEligibility,
} from '@/modules/subscription/resolve-refund-eligibility.helper';
import { SubscriptionService } from '@/modules/subscription/subscription.service';

export type SubscriptionSupportPaymentFailure = {
  readonly createdAt: Date;
  readonly invoiceStatus: string | null;
};

export type SubscriptionSupportContext = {
  readonly computedAt: Date;
  readonly subscription: SubscriptionEntity;
  readonly readingAccessState: ReadingAccessState;
  readonly trialEligible: boolean;
  readonly accessExplanationCode: 'paid_until_period_end' | 'trial_until' | 'free';
  readonly refundEligible: boolean;
  readonly refundIneligibilityCode: RefundEligibility['refundIneligibilityCode'];
  readonly stripeCustomerId: string | null;
  readonly stripeSubscriptionId: string | null;
  readonly latestPaymentFailure: SubscriptionSupportPaymentFailure | null;
};

@Injectable()
export class SubscriptionSupportService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getSupportContext(subscriptionId: number): Promise<SubscriptionSupportContext> {
    const computedAt = new Date();
    const subscription: SubscriptionEntity =
      await this.subscriptionService.getSubscriptionById(subscriptionId);
    const readingAccessState: ReadingAccessState = resolveReadingAccessState(
      subscription,
      computedAt,
    );
    const refund: RefundEligibility = resolveRefundEligibility(subscription, computedAt);
    const failures = await this.auditLogService.listAuditLogs({
      action: AuditAction.SUBSCRIPTION_PAYMENT_FAILED,
      subjectType: AuditSubjectType.SUBSCRIPTION,
      subjectId: subscription.id,
      limit: 1,
      offset: 0,
    });
    const latest = failures.entities[0];
    return {
      computedAt,
      subscription,
      readingAccessState,
      trialEligible: isTrialEligible(subscription, computedAt),
      accessExplanationCode: toAccessExplanationCode(readingAccessState),
      refundEligible: refund.refundEligible,
      refundIneligibilityCode: refund.refundIneligibilityCode,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      latestPaymentFailure:
        latest === undefined
          ? null
          : {
              createdAt: latest.createdAt,
              invoiceStatus: readInvoiceStatus(latest.metadata),
            },
    };
  }
}

function toAccessExplanationCode(
  state: ReadingAccessState,
): SubscriptionSupportContext['accessExplanationCode'] {
  if (state === ReadingAccessState.PAID) {
    return 'paid_until_period_end';
  }
  if (state === ReadingAccessState.TRIAL) {
    return 'trial_until';
  }
  return 'free';
}

function readInvoiceStatus(metadata: unknown): string | null {
  if (typeof metadata !== 'object' || metadata === null || !('invoiceStatus' in metadata)) {
    return null;
  }
  const invoiceStatus: unknown = metadata.invoiceStatus;
  return typeof invoiceStatus === 'string' ? invoiceStatus : null;
}

export function toPlanSummary(plan: PlanEntity | undefined): {
  readonly id: number;
  readonly name: string;
  readonly kind: string;
  readonly interval: string | null;
  readonly amountCents: number | null;
  readonly currency: string | null;
} | null {
  if (plan === undefined) {
    return null;
  }
  return {
    id: plan.id,
    name: plan.name,
    kind: plan.kind,
    interval: plan.interval,
    amountCents: plan.amountCents,
    currency: plan.currency,
  };
}
