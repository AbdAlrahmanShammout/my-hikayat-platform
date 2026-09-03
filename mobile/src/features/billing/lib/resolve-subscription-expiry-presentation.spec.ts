import {
  resolveSubscriptionExpiryPresentation,
  SUBSCRIPTION_EXPIRY_APPROACHING_THRESHOLD_MS,
  type SubscriptionExpiryPresentation,
} from '@/features/billing/lib/resolve-subscription-expiry-presentation';
import type { ReaderSubscription } from '@/features/billing/api/get-reader-subscription';

function createSubscription(
  overrides: Partial<ReaderSubscription> &
    Pick<ReaderSubscription, 'readingAccessState' | 'trialEligible'>,
): ReaderSubscription {
  return {
    id: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    userId: 2,
    planId: 1,
    status: 'active',
    startedAt: '2026-01-01T00:00:00.000Z',
    currentPeriodStart: null,
    currentPeriodEnd: null,
    canceledAt: null,
    activatedAt: null,
    trialStartedAt: null,
    trialEndsAt: null,
    plan: {
      id: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      slug: 'free',
      name: 'Free',
      description: 'Free reading tier',
      kind: 'free',
      interval: null,
      amountCents: null,
      currency: null,
    },
    ...overrides,
  };
}

const monthlyPlan: ReaderSubscription['plan'] = {
  id: 2,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  slug: 'monthly',
  name: 'Monthly',
  description: 'Full-book reading',
  kind: 'monthly_paid',
  interval: 'month',
  amountCents: 999,
  currency: 'usd',
};

describe('resolveSubscriptionExpiryPresentation', () => {
  const now: Date = new Date('2026-09-03T12:00:00.000Z');

  it('hides when subscription is missing', () => {
    const actual: SubscriptionExpiryPresentation =
      resolveSubscriptionExpiryPresentation(undefined, now);
    expect(actual).toEqual({ kind: 'hidden' });
  });

  it('hides an active trial beyond the approaching window', () => {
    const input: ReaderSubscription = createSubscription({
      readingAccessState: 'trial',
      trialEligible: false,
      trialEndsAt: new Date(
        now.getTime() + SUBSCRIPTION_EXPIRY_APPROACHING_THRESHOLD_MS + 60_000,
      ).toISOString(),
    });
    const actual: SubscriptionExpiryPresentation = resolveSubscriptionExpiryPresentation(
      input,
      now,
    );
    expect(actual.kind).toBe('hidden');
  });

  it('surfaces trial approaching within the threshold', () => {
    const input: ReaderSubscription = createSubscription({
      readingAccessState: 'trial',
      trialEligible: false,
      trialEndsAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    });
    const actual: SubscriptionExpiryPresentation = resolveSubscriptionExpiryPresentation(
      input,
      now,
    );
    expect(actual.kind).toBe('trial_approaching');
    if (actual.kind !== 'trial_approaching') {
      return;
    }
    expect(actual.title).toContain('ending soon');
    expect(actual.detailLabel).toContain('remaining');
  });

  it('surfaces paid approaching for an active paid period', () => {
    const input: ReaderSubscription = createSubscription({
      readingAccessState: 'paid',
      trialEligible: false,
      status: 'active',
      currentPeriodEnd: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      plan: monthlyPlan,
    });
    const actual: SubscriptionExpiryPresentation = resolveSubscriptionExpiryPresentation(
      input,
      now,
    );
    expect(actual.kind).toBe('paid_approaching');
    if (actual.kind !== 'paid_approaching') {
      return;
    }
    expect(actual.title).toContain('renews soon');
  });

  it('surfaces paid approaching with canceled copy when status is canceled', () => {
    const input: ReaderSubscription = createSubscription({
      readingAccessState: 'paid',
      trialEligible: false,
      status: 'canceled',
      currentPeriodEnd: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      plan: monthlyPlan,
    });
    const actual: SubscriptionExpiryPresentation = resolveSubscriptionExpiryPresentation(
      input,
      now,
    );
    expect(actual.kind).toBe('paid_approaching');
    if (actual.kind !== 'paid_approaching') {
      return;
    }
    expect(actual.title).toContain('ending soon');
  });

  it('surfaces trial ended after the server flips access to free', () => {
    const input: ReaderSubscription = createSubscription({
      readingAccessState: 'free',
      trialEligible: false,
      trialStartedAt: '2026-08-20T12:00:00.000Z',
      trialEndsAt: '2026-08-27T12:00:00.000Z',
    });
    const actual: SubscriptionExpiryPresentation = resolveSubscriptionExpiryPresentation(
      input,
      now,
    );
    expect(actual.kind).toBe('trial_ended');
  });

  it('surfaces paid ended when the canceled period is in the past', () => {
    const input: ReaderSubscription = createSubscription({
      readingAccessState: 'free',
      trialEligible: false,
      status: 'canceled',
      currentPeriodEnd: '2026-08-01T00:00:00.000Z',
      plan: monthlyPlan,
    });
    const actual: SubscriptionExpiryPresentation = resolveSubscriptionExpiryPresentation(
      input,
      now,
    );
    expect(actual.kind).toBe('paid_ended');
  });

  it('hides free accounts that never used trial or paid access', () => {
    const input: ReaderSubscription = createSubscription({
      readingAccessState: 'free',
      trialEligible: true,
    });
    const actual: SubscriptionExpiryPresentation = resolveSubscriptionExpiryPresentation(
      input,
      now,
    );
    expect(actual.kind).toBe('hidden');
  });
});
