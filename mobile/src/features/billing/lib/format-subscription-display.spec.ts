import {
  formatSubscriptionDisplay,
  type SubscriptionDisplay,
} from '@/features/billing/lib/format-subscription-display';
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

describe('formatSubscriptionDisplay', () => {
  it('formats a fresh free plan with trial CTA available', () => {
    const input: ReaderSubscription = createSubscription({
      readingAccessState: 'free',
      trialEligible: true,
    });
    const actual: SubscriptionDisplay = formatSubscriptionDisplay(input);
    expect(actual.planLabel).toBe('Free (free)');
    expect(actual.statusLabel).toBe('Active');
    expect(actual.accessLabel).toBe('Free');
    expect(actual.periodLabel).toBeNull();
    expect(actual.trialRemainingLabel).toBeNull();
    expect(actual.canOfferTrialAction).toBe(true);
    expect(actual.canOfferRefundAction).toBe(false);
  });

  it('formats an active trial with remaining time display only', () => {
    const now: Date = new Date('2026-08-29T12:00:00.000Z');
    const input: ReaderSubscription = createSubscription({
      readingAccessState: 'trial',
      trialEligible: false,
      trialStartedAt: '2026-08-29T12:00:00.000Z',
      trialEndsAt: '2026-09-05T12:00:00.000Z',
    });
    const actual: SubscriptionDisplay = formatSubscriptionDisplay(input, now);
    expect(actual.accessLabel).toBe('Free Trial');
    expect(actual.trialRemainingLabel).toBe('7 days remaining');
    expect(actual.canOfferTrialAction).toBe(false);
    expect(actual.canOfferRefundAction).toBe(false);
  });

  it('hides the trial CTA after the trial is used', () => {
    const input: ReaderSubscription = createSubscription({
      readingAccessState: 'free',
      trialEligible: false,
      trialStartedAt: '2026-08-01T00:00:00.000Z',
      trialEndsAt: '2026-08-08T00:00:00.000Z',
    });
    const actual: SubscriptionDisplay = formatSubscriptionDisplay(input);
    expect(actual.accessLabel).toBe('Free');
    expect(actual.canOfferTrialAction).toBe(false);
    expect(actual.trialRemainingLabel).toBeNull();
  });

  it('formats a monthly plan with period end and refund action available', () => {
    const input: ReaderSubscription = createSubscription({
      id: 2,
      planId: 2,
      status: 'canceled',
      currentPeriodStart: '2026-08-01T00:00:00.000Z',
      currentPeriodEnd: '2026-09-01T00:00:00.000Z',
      canceledAt: '2026-08-10T00:00:00.000Z',
      activatedAt: '2026-08-01T00:00:00.000Z',
      readingAccessState: 'paid',
      trialEligible: false,
      plan: {
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
      },
    });
    const actual: SubscriptionDisplay = formatSubscriptionDisplay(input);
    expect(actual.planLabel).toBe('Monthly (monthly)');
    expect(actual.statusLabel).toBe('Canceled');
    expect(actual.accessLabel).toBe('Paid');
    expect(actual.periodLabel).toContain('Paid access through');
    expect(actual.canOfferTrialAction).toBe(false);
    expect(actual.canOfferRefundAction).toBe(true);
  });
});
