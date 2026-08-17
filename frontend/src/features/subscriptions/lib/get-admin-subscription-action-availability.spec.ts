import { describe, expect, it } from 'vitest';

import { getAdminSubscriptionActionAvailability } from '@/features/subscriptions/lib/get-admin-subscription-action-availability';

describe('getAdminSubscriptionActionAvailability', () => {
  it('allows cancel and refund for an active paid plan', () => {
    const actualAvailability = getAdminSubscriptionActionAvailability({
      status: 'active',
      plan: { kind: 'monthly_paid' },
    });
    expect(actualAvailability.canCancel).toBe(true);
    expect(actualAvailability.canRefund).toBe(true);
    expect(actualAvailability.cancelDisabledReason).toBeNull();
    expect(actualAvailability.refundDisabledReason).toBeNull();
  });

  it('disables cancel and refund when the subscription is already canceled', () => {
    const actualAvailability = getAdminSubscriptionActionAvailability({ status: 'canceled' });
    expect(actualAvailability.canCancel).toBe(false);
    expect(actualAvailability.canRefund).toBe(false);
    expect(actualAvailability.cancelDisabledReason).toContain('already canceled');
    expect(actualAvailability.refundDisabledReason).toContain('already canceled');
  });

  it('disables refund when the displayed plan kind is free', () => {
    const actualAvailability = getAdminSubscriptionActionAvailability({
      status: 'active',
      plan: { kind: 'free' },
    });
    expect(actualAvailability.canCancel).toBe(true);
    expect(actualAvailability.canRefund).toBe(false);
    expect(actualAvailability.refundDisabledReason).toContain('free');
  });
});
