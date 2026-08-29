import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import {
  PlanInterval,
  PlanKind,
  SubscriptionStatus,
} from '@/modules/subscription/enum/general.enum';
import { hasFullBookReadingEntitlement } from '@/modules/subscription/has-full-book-reading-entitlement.helper';
import { hasTrialReadingEntitlement } from '@/modules/subscription/has-trial-reading-entitlement.helper';
import {
  isTrialEligible,
  ReadingAccessState,
  resolveReadingAccessState,
} from '@/modules/subscription/resolve-reading-access-state.helper';

const NOW: Date = new Date('2026-08-16T12:00:00.000Z');
const FUTURE: Date = new Date('2026-08-23T12:00:00.000Z');
const PAST: Date = new Date('2026-08-01T00:00:00.000Z');

function createSamplePlan(kind: PlanKind): PlanEntity {
  return new PlanEntity({
    id: kind === PlanKind.FREE ? 1 : 2,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    slug: kind === PlanKind.FREE ? 'free' : 'monthly',
    name: kind === PlanKind.FREE ? 'Free' : 'Monthly',
    description: kind === PlanKind.FREE ? 'Free tier' : 'Monthly paid',
    kind,
    interval: kind === PlanKind.FREE ? null : PlanInterval.MONTH,
    stripePriceId: kind === PlanKind.FREE ? null : 'price_seed_monthly',
    amountCents: kind === PlanKind.FREE ? null : 999,
    currency: kind === PlanKind.FREE ? null : 'usd',
  });
}

function createSampleSubscription(input: {
  readonly kind: PlanKind;
  readonly trialStartedAt?: Date | null;
  readonly trialEndsAt?: Date | null;
  readonly currentPeriodEnd?: Date | null;
}): SubscriptionEntity {
  const plan = createSamplePlan(input.kind);
  return new SubscriptionEntity({
    id: 7,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 5,
    planId: plan.id,
    status: SubscriptionStatus.ACTIVE,
    startedAt: new Date('2026-01-01T00:00:00.000Z'),
    currentPeriodStart: input.currentPeriodEnd === null ? null : new Date('2026-08-01T00:00:00.000Z'),
    currentPeriodEnd: input.currentPeriodEnd === undefined ? FUTURE : input.currentPeriodEnd,
    canceledAt: null,
    activatedAt: null,
    trialStartedAt: input.trialStartedAt === undefined ? null : input.trialStartedAt,
    trialEndsAt: input.trialEndsAt === undefined ? null : input.trialEndsAt,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    plan,
  });
}

describe('hasTrialReadingEntitlement', () => {
  it('returns true when the trial window is open', () => {
    const actualResult = hasTrialReadingEntitlement(
      createSampleSubscription({
        kind: PlanKind.FREE,
        trialStartedAt: NOW,
        trialEndsAt: FUTURE,
        currentPeriodEnd: null,
      }),
      NOW,
    );
    expect(actualResult).toBe(true);
  });

  it('returns false after trialEndsAt', () => {
    const actualResult = hasTrialReadingEntitlement(
      createSampleSubscription({
        kind: PlanKind.FREE,
        trialStartedAt: PAST,
        trialEndsAt: PAST,
        currentPeriodEnd: null,
      }),
      NOW,
    );
    expect(actualResult).toBe(false);
  });

  it('returns false when trial dates are missing', () => {
    const actualResult = hasTrialReadingEntitlement(
      createSampleSubscription({ kind: PlanKind.FREE, currentPeriodEnd: null }),
      NOW,
    );
    expect(actualResult).toBe(false);
  });
});

describe('hasFullBookReadingEntitlement', () => {
  it('returns true for an active trial or paid period', () => {
    expect(
      hasFullBookReadingEntitlement(
        createSampleSubscription({
          kind: PlanKind.FREE,
          trialStartedAt: NOW,
          trialEndsAt: FUTURE,
          currentPeriodEnd: null,
        }),
        NOW,
      ),
    ).toBe(true);
    expect(
      hasFullBookReadingEntitlement(
        createSampleSubscription({ kind: PlanKind.MONTHLY_PAID }),
        NOW,
      ),
    ).toBe(true);
  });

  it('returns false for free without an open trial', () => {
    expect(
      hasFullBookReadingEntitlement(
        createSampleSubscription({ kind: PlanKind.FREE, currentPeriodEnd: null }),
        NOW,
      ),
    ).toBe(false);
  });
});

describe('resolveReadingAccessState', () => {
  it('prefers paid over trial when both could apply', () => {
    const subscription = createSampleSubscription({
      kind: PlanKind.MONTHLY_PAID,
      trialStartedAt: NOW,
      trialEndsAt: FUTURE,
    });
    expect(resolveReadingAccessState(subscription, NOW)).toBe(ReadingAccessState.PAID);
  });

  it('reports trial when only the trial window is open', () => {
    expect(
      resolveReadingAccessState(
        createSampleSubscription({
          kind: PlanKind.FREE,
          trialStartedAt: NOW,
          trialEndsAt: FUTURE,
          currentPeriodEnd: null,
        }),
        NOW,
      ),
    ).toBe(ReadingAccessState.TRIAL);
  });

  it('reports free otherwise', () => {
    expect(
      resolveReadingAccessState(
        createSampleSubscription({ kind: PlanKind.FREE, currentPeriodEnd: null }),
        NOW,
      ),
    ).toBe(ReadingAccessState.FREE);
  });
});

describe('isTrialEligible', () => {
  it('is true when trial was never started and the user is not paid', () => {
    expect(
      isTrialEligible(createSampleSubscription({ kind: PlanKind.FREE, currentPeriodEnd: null }), NOW),
    ).toBe(true);
    expect(isTrialEligible(null, NOW)).toBe(true);
  });

  it('is false when trial was started or the user is paid', () => {
    expect(
      isTrialEligible(
        createSampleSubscription({
          kind: PlanKind.FREE,
          trialStartedAt: PAST,
          trialEndsAt: PAST,
          currentPeriodEnd: null,
        }),
        NOW,
      ),
    ).toBe(false);
    expect(
      isTrialEligible(createSampleSubscription({ kind: PlanKind.MONTHLY_PAID }), NOW),
    ).toBe(false);
  });
});
