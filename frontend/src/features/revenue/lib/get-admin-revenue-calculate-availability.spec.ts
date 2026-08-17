import { describe, expect, it } from 'vitest';

import { getAdminRevenueCalculateAvailability } from '@/features/revenue/lib/get-admin-revenue-calculate-availability';

describe('getAdminRevenueCalculateAvailability', () => {
  it('allows calculate when pool cents are set', () => {
    const actualAvailability = getAdminRevenueCalculateAvailability({ poolAmountCents: 10000 });
    expect(actualAvailability.canCalculate).toBe(true);
    expect(actualAvailability.calculateDisabledReason).toBeNull();
  });

  it('disables calculate when the pool is unset', () => {
    const actualAvailability = getAdminRevenueCalculateAvailability({ poolAmountCents: null });
    expect(actualAvailability.canCalculate).toBe(false);
  });
});
