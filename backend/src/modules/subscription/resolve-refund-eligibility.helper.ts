import { REFUND_WINDOW } from '@/modules/subscription/consts/refund-window.constant';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { PlanKind, SubscriptionStatus } from '@/modules/subscription/enum/general.enum';

export const REFUND_INELIGIBILITY_CODE = {
  WINDOW_EXPIRED: 'REFUND_WINDOW_EXPIRED',
  NOT_ELIGIBLE: 'REFUND_NOT_ELIGIBLE',
} as const;

export type RefundIneligibilityCode =
  (typeof REFUND_INELIGIBILITY_CODE)[keyof typeof REFUND_INELIGIBILITY_CODE];

export type RefundEligibility = {
  readonly refundEligible: boolean;
  readonly refundIneligibilityCode: RefundIneligibilityCode | null;
};

/**
 * Same predicates as a managed refund: active monthly paid Stripe subscription
 * inside the refund window measured from activatedAt, else currentPeriodStart.
 */
export function resolveRefundEligibility(
  subscription: SubscriptionEntity,
  now: Date = new Date(),
): RefundEligibility {
  const activatedAt: Date | null = subscription.activatedAt ?? subscription.currentPeriodStart;
  const isPaidMonthly: boolean =
    subscription.status === SubscriptionStatus.ACTIVE &&
    subscription.plan?.kind === PlanKind.MONTHLY_PAID;
  if (!isPaidMonthly || subscription.stripeSubscriptionId === null || activatedAt === null) {
    return {
      refundEligible: false,
      refundIneligibilityCode: REFUND_INELIGIBILITY_CODE.NOT_ELIGIBLE,
    };
  }
  const windowMs: number = REFUND_WINDOW.days * REFUND_WINDOW.millisecondsPerDay;
  if (now.getTime() > activatedAt.getTime() + windowMs) {
    return {
      refundEligible: false,
      refundIneligibilityCode: REFUND_INELIGIBILITY_CODE.WINDOW_EXPIRED,
    };
  }
  return { refundEligible: true, refundIneligibilityCode: null };
}
