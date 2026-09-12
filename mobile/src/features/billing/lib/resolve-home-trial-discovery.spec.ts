import {
  resolveHomeTrialDiscovery,
  type HomeTrialDiscovery,
} from '@/features/billing/lib/resolve-home-trial-discovery';
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

describe('resolveHomeTrialDiscovery', () => {
  it('shows an offer when the account is trial eligible', () => {
    const actual: HomeTrialDiscovery = resolveHomeTrialDiscovery(
      createSubscription({
        readingAccessState: 'free',
        trialEligible: true,
      }),
    );
    expect(actual.kind).toBe('offer');
    if (actual.kind === 'offer') {
      expect(actual.actionLabel).toBe('Try free');
    }
  });

  it('shows active trial remaining time when on trial', () => {
    const now: Date = new Date('2026-08-29T12:00:00.000Z');
    const actual: HomeTrialDiscovery = resolveHomeTrialDiscovery(
      createSubscription({
        readingAccessState: 'trial',
        trialEligible: false,
        trialStartedAt: '2026-08-29T12:00:00.000Z',
        trialEndsAt: '2026-09-05T12:00:00.000Z',
      }),
      now,
    );
    expect(actual).toEqual({
      kind: 'active',
      title: 'Free trial active',
      body: 'Full books are open while the trial lasts.',
      remainingLabel: '7 days remaining',
      actionLabel: 'Subscribe',
    });
  });

  it('hides active trial discovery when near-expiry banner owns the messaging', () => {
    const now: Date = new Date('2026-09-03T12:00:00.000Z');
    const actual: HomeTrialDiscovery = resolveHomeTrialDiscovery(
      createSubscription({
        readingAccessState: 'trial',
        trialEligible: false,
        trialEndsAt: '2026-09-05T12:00:00.000Z',
      }),
      now,
    );
    expect(actual.kind).toBe('hidden');
  });

  it('hides for paid, ineligible free, and missing subscription', () => {
    expect(
      resolveHomeTrialDiscovery(
        createSubscription({
          readingAccessState: 'paid',
          trialEligible: false,
        }),
      ).kind,
    ).toBe('hidden');
    expect(
      resolveHomeTrialDiscovery(
        createSubscription({
          readingAccessState: 'free',
          trialEligible: false,
        }),
      ).kind,
    ).toBe('hidden');
    expect(resolveHomeTrialDiscovery(undefined).kind).toBe('hidden');
  });
});
