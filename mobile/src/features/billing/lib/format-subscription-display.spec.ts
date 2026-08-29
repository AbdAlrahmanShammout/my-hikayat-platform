import {
  formatSubscriptionDisplay,
  type SubscriptionDisplay,
} from '@/features/billing/lib/format-subscription-display';
import type { ReaderSubscription } from '@/features/billing/api/get-reader-subscription';

describe('formatSubscriptionDisplay', () => {
  it('formats a free plan without a refund action', () => {
    const input: ReaderSubscription = {
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
    };
    const actual: SubscriptionDisplay = formatSubscriptionDisplay(input);
    expect(actual.planLabel).toBe('Free (free)');
    expect(actual.statusLabel).toBe('Active');
    expect(actual.periodLabel).toBeNull();
    expect(actual.canOfferRefundAction).toBe(false);
  });

  it('formats a monthly plan with period end and refund action available', () => {
    const input: ReaderSubscription = {
      id: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      userId: 2,
      planId: 2,
      status: 'canceled',
      startedAt: '2026-01-01T00:00:00.000Z',
      currentPeriodStart: '2026-08-01T00:00:00.000Z',
      currentPeriodEnd: '2026-09-01T00:00:00.000Z',
      canceledAt: '2026-08-10T00:00:00.000Z',
      activatedAt: '2026-08-01T00:00:00.000Z',
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
    };
    const actual: SubscriptionDisplay = formatSubscriptionDisplay(input);
    expect(actual.planLabel).toBe('Monthly (monthly)');
    expect(actual.statusLabel).toBe('Canceled');
    expect(actual.periodLabel).toContain('Paid access through');
    expect(actual.canOfferRefundAction).toBe(true);
  });
});
