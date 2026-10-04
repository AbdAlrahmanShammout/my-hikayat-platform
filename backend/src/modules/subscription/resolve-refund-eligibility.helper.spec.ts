import { REFUND_WINDOW } from '@/modules/subscription/consts/refund-window.constant';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { PlanKind, SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import {
  REFUND_INELIGIBILITY_CODE,
  resolveRefundEligibility,
} from '@/modules/subscription/resolve-refund-eligibility.helper';

const NOW = new Date('2026-08-10T00:00:00.000Z');

function createSubscription(overrides: Partial<SubscriptionEntity> = {}): SubscriptionEntity {
  return new SubscriptionEntity({
    id: 7,
    createdAt: NOW,
    updatedAt: NOW,
    userId: 5,
    planId: 2,
    status: SubscriptionStatus.ACTIVE,
    startedAt: NOW,
    currentPeriodStart: NOW,
    currentPeriodEnd: new Date('2026-09-10T00:00:00.000Z'),
    canceledAt: null,
    activatedAt: NOW,
    trialStartedAt: null,
    trialEndsAt: null,
    stripeCustomerId: 'cus_123',
    stripeSubscriptionId: 'sub_123',
    plan: new PlanEntity({
      id: 2,
      createdAt: NOW,
      updatedAt: NOW,
      slug: 'monthly',
      name: 'Monthly',
      description: 'Paid',
      kind: PlanKind.MONTHLY_PAID,
      interval: 'month',
      stripePriceId: 'price_123',
      amountCents: 999,
      currency: 'usd',
    }),
    ...overrides,
  });
}

describe('resolveRefundEligibility', () => {
  it('marks an active monthly Stripe subscription inside the window as eligible', () => {
    const actualEligibility = resolveRefundEligibility(createSubscription(), NOW);
    expect(actualEligibility).toEqual({ refundEligible: true, refundIneligibilityCode: null });
  });

  it('uses the same expired-window code as a managed refund', () => {
    const activatedAt = new Date(
      NOW.getTime() - (REFUND_WINDOW.days + 1) * REFUND_WINDOW.millisecondsPerDay,
    );
    const actualEligibility = resolveRefundEligibility(createSubscription({ activatedAt }), NOW);
    expect(actualEligibility.refundEligible).toBe(false);
    expect(actualEligibility.refundIneligibilityCode).toBe(REFUND_INELIGIBILITY_CODE.WINDOW_EXPIRED);
  });

  it('rejects a subscription without a Stripe subscription id', () => {
    const actualEligibility = resolveRefundEligibility(
      createSubscription({ stripeSubscriptionId: null }),
      NOW,
    );
    expect(actualEligibility.refundIneligibilityCode).toBe(REFUND_INELIGIBILITY_CODE.NOT_ELIGIBLE);
  });
});
