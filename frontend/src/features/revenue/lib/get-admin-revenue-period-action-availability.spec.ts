import { describe, expect, it } from 'vitest';

import { getAdminRevenuePeriodActionAvailability } from '@/features/revenue/lib/get-admin-revenue-period-action-availability';

describe('getAdminRevenuePeriodActionAvailability', () => {
  it('allows close and cut edits on an open period', () => {
    const actualAvailability = getAdminRevenuePeriodActionAvailability({ status: 'open' });
    expect(actualAvailability).toEqual({
      canClose: true,
      canEditPlatformCut: true,
      closeDisabledReason: null,
      platformCutDisabledReason: null,
    });
  });

  it('disables close and cut edits on a closed period', () => {
    const actualAvailability = getAdminRevenuePeriodActionAvailability({ status: 'closed' });
    expect(actualAvailability.canClose).toBe(false);
    expect(actualAvailability.canEditPlatformCut).toBe(false);
  });
});
