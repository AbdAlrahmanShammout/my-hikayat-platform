import { describe, expect, it } from 'vitest';

import { getAdminSubscriptionActionAvailability } from '@/features/subscriptions/lib/get-admin-subscription-action-availability';

describe('getAdminSubscriptionActionAvailability', () => {
  it('allows cancel for an active subscription', () => {
    const actualAvailability = getAdminSubscriptionActionAvailability({ status: 'active' });
    expect(actualAvailability.canCancel).toBe(true);
    expect(actualAvailability.cancelDisabledReason).toBeNull();
  });

  it('disables cancel when the subscription is already canceled', () => {
    const actualAvailability = getAdminSubscriptionActionAvailability({ status: 'canceled' });
    expect(actualAvailability.canCancel).toBe(false);
    expect(actualAvailability.cancelDisabledReason).toContain('already canceled');
  });
});
