import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import {
  PlanInterval,
  PlanKind,
  SubscriptionStatus,
} from '@/modules/subscription/enum/general.enum';

import { resolveSubscriptionPeriodProgress } from './resolve-subscription-period-progress.helper';

function createPlan(kind: PlanKind): PlanEntity {
  return new PlanEntity({
    id: kind === PlanKind.FREE ? 1 : 2,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    slug: kind === PlanKind.FREE ? 'free' : 'monthly',
    name: kind === PlanKind.FREE ? 'Free' : 'Monthly',
    description: 'Plan',
    kind,
    interval: kind === PlanKind.FREE ? null : PlanInterval.MONTH,
    stripePriceId: kind === PlanKind.FREE ? null : 'price_monthly',
    amountCents: kind === PlanKind.FREE ? null : 999,
    currency: kind === PlanKind.FREE ? null : 'usd',
  });
}

function createSubscription(
  overrides: Partial<ConstructorParameters<typeof SubscriptionEntity>[0]> = {},
): SubscriptionEntity {
  return new SubscriptionEntity({
    id: 7,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 5,
    planId: 1,
    status: SubscriptionStatus.ACTIVE,
    startedAt: new Date('2026-01-01T00:00:00.000Z'),
    currentPeriodStart: null,
    currentPeriodEnd: null,
    canceledAt: null,
    activatedAt: null,
    trialStartedAt: null,
    trialEndsAt: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    plan: createPlan(PlanKind.FREE),
    ...overrides,
  });
}

describe('resolveSubscriptionPeriodProgress', () => {
  const now = new Date('2026-09-08T00:00:00.000Z');

  it('returns no countdown when there is no subscription', () => {
    const actualProgress = resolveSubscriptionPeriodProgress(null, now);
    expect(actualProgress.remainingMs).toBeNull();
    expect(actualProgress.elapsedPercent).toBeNull();
  });

  it('returns no countdown for a permanent free plan', () => {
    const actualProgress = resolveSubscriptionPeriodProgress(createSubscription(), now);
    expect(actualProgress.periodStartedAt).toBeNull();
    expect(actualProgress.remainingMs).toBeNull();
    expect(actualProgress.elapsedPercent).toBeNull();
  });

  it('uses the paid period for an active paid subscription', () => {
    const actualProgress = resolveSubscriptionPeriodProgress(
      createSubscription({
        planId: 2,
        plan: createPlan(PlanKind.MONTHLY_PAID),
        currentPeriodStart: new Date('2026-09-01T00:00:00.000Z'),
        currentPeriodEnd: new Date('2026-10-01T00:00:00.000Z'),
      }),
      now,
    );
    expect(actualProgress.elapsedPercent).toBe(23);
    expect(actualProgress.remainingMs).toBe(23 * 24 * 60 * 60 * 1000);
    expect(actualProgress.periodEndsAt).toEqual(new Date('2026-10-01T00:00:00.000Z'));
  });

  it('uses the trial window for an active trial', () => {
    const actualProgress = resolveSubscriptionPeriodProgress(
      createSubscription({
        trialStartedAt: new Date('2026-09-01T00:00:00.000Z'),
        trialEndsAt: new Date('2026-09-15T00:00:00.000Z'),
      }),
      now,
    );
    expect(actualProgress.elapsedPercent).toBe(50);
    expect(actualProgress.remainingMs).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('shows a completed period for an expired paid subscription', () => {
    const actualProgress = resolveSubscriptionPeriodProgress(
      createSubscription({
        status: SubscriptionStatus.CANCELED,
        currentPeriodStart: new Date('2026-07-01T00:00:00.000Z'),
        currentPeriodEnd: new Date('2026-08-01T00:00:00.000Z'),
        canceledAt: new Date('2026-07-20T00:00:00.000Z'),
      }),
      now,
    );
    expect(actualProgress.elapsedPercent).toBe(100);
    expect(actualProgress.remainingMs).toBe(0);
  });
});
