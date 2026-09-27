import type { SubscriptionDisplay } from '@/features/billing/lib/format-subscription-display';

import { resolveMeSubscriptionSummary } from './resolve-me-subscription-summary';

function createDisplay(overrides: Partial<SubscriptionDisplay>): SubscriptionDisplay {
  return {
    planLabel: 'Free (free)',
    statusLabel: 'Active',
    accessLabel: 'Free',
    periodLabel: null,
    trialRemainingLabel: null,
    cancelAccessNote: null,
    canOfferTrialAction: false,
    canOfferRefundAction: false,
    canOfferCancelAction: false,
    canOfferReactivateCheckout: false,
    ...overrides,
  };
}

describe('resolveMeSubscriptionSummary', () => {
  it('shows an active trial with a link to plans', () => {
    const actual = resolveMeSubscriptionSummary({
      display: createDisplay({
        accessLabel: 'Free Trial',
        trialRemainingLabel: '7 days remaining',
      }),
      planName: 'Free',
    });
    expect(actual).toEqual({
      title: 'Free trial',
      detail: '7 days remaining',
      note: null,
      action: 'see_plans',
      actionLabel: 'See plans',
    });
  });

  it('shows a paid plan with manage', () => {
    const actual = resolveMeSubscriptionSummary({
      display: createDisplay({
        planLabel: 'Monthly (monthly)',
        accessLabel: 'Paid',
        periodLabel: 'Paid access through Sep 1, 2026',
        canOfferCancelAction: true,
        canOfferRefundAction: true,
      }),
      planName: 'Monthly',
    });
    expect(actual.action).toBe('manage');
    expect(actual.title).toBe('Monthly');
    expect(actual.detail).toBe('Paid');
    expect(actual.actionLabel).toBe('Manage');
  });

  it('sends a canceled plan to plans instead of manage', () => {
    const actual = resolveMeSubscriptionSummary({
      display: createDisplay({
        statusLabel: 'Canceled',
        accessLabel: 'Paid',
        cancelAccessNote: 'Canceled. You can keep reading until the paid period ends.',
        canOfferReactivateCheckout: true,
      }),
      planName: 'Monthly',
    });
    expect(actual.action).toBe('see_plans');
    expect(actual.title).toBe('Monthly');
    expect(actual.note).toContain('keep reading');
  });

  it('offers a trial start when the server says the account is eligible', () => {
    const actual = resolveMeSubscriptionSummary({
      display: createDisplay({ canOfferTrialAction: true }),
      planName: 'Free',
    });
    expect(actual).toMatchObject({
      title: 'Free',
      detail: 'Full books need a plan.',
      action: 'start_trial',
      actionLabel: 'Start free trial',
    });
  });

  it('points a free account without a trial offer to plans', () => {
    const actual = resolveMeSubscriptionSummary({
      display: createDisplay({ canOfferTrialAction: false }),
      planName: 'Free',
    });
    expect(actual.action).toBe('see_plans');
    expect(actual.actionLabel).toBe('See plans');
  });
});
