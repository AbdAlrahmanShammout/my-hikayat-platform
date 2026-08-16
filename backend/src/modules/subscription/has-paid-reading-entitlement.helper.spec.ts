import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import {
  PlanInterval,
  PlanKind,
  SubscriptionStatus,
} from '@/modules/subscription/enum/general.enum';
import { hasPaidReadingEntitlement } from '@/modules/subscription/has-paid-reading-entitlement.helper';

const NOW: Date = new Date('2026-08-16T12:00:00.000Z');
const FUTURE_PERIOD_END: Date = new Date('2026-09-01T00:00:00.000Z');
const PAST_PERIOD_END: Date = new Date('2026-08-01T00:00:00.000Z');

function createSamplePlan(kind: PlanKind): PlanEntity {
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

function createSampleSubscription(input: {
  readonly kind: PlanKind;
  readonly status?: SubscriptionStatus;
  readonly currentPeriodEnd?: Date | null;
}): SubscriptionEntity {
  const plan = createSamplePlan(input.kind);
  const status = input.status ?? SubscriptionStatus.ACTIVE;
  const currentPeriodEnd =
    input.currentPeriodEnd === undefined ? FUTURE_PERIOD_END : input.currentPeriodEnd;
  return new SubscriptionEntity({
    id: 7,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 5,
    planId: plan.id,
    status,
    startedAt: new Date('2026-01-01T00:00:00.000Z'),
    currentPeriodStart: currentPeriodEnd === null ? null : new Date('2026-08-01T00:00:00.000Z'),
    currentPeriodEnd,
    canceledAt: status === SubscriptionStatus.CANCELED ? NOW : null,
    activatedAt: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    plan,
  });
}

describe('hasPaidReadingEntitlement', () => {
  it('returns true for a paid period that has not ended', () => {
    const actualResult = hasPaidReadingEntitlement(
      createSampleSubscription({ kind: PlanKind.MONTHLY_PAID }),
      NOW,
    );
    expect(actualResult).toBe(true);
  });

  it('returns true for a canceled paid subscription before currentPeriodEnd', () => {
    const actualResult = hasPaidReadingEntitlement(
      createSampleSubscription({
        kind: PlanKind.MONTHLY_PAID,
        status: SubscriptionStatus.CANCELED,
      }),
      NOW,
    );
    expect(actualResult).toBe(true);
  });

  it('returns false after currentPeriodEnd even when status is still active', () => {
    const actualResult = hasPaidReadingEntitlement(
      createSampleSubscription({
        kind: PlanKind.MONTHLY_PAID,
        currentPeriodEnd: PAST_PERIOD_END,
      }),
      NOW,
    );
    expect(actualResult).toBe(false);
  });

  it('never treats a free plan as paid entitlement', () => {
    const actualResult = hasPaidReadingEntitlement(
      createSampleSubscription({ kind: PlanKind.FREE }),
      NOW,
    );
    expect(actualResult).toBe(false);
  });
});
