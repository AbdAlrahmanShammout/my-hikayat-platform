import { describe, expect, it } from 'vitest';

import { buildCreateAdminRevenuePeriodBody } from '@/features/revenue/lib/build-create-admin-revenue-period-body';

describe('buildCreateAdminRevenuePeriodBody', () => {
  it('sends the whole UTC month as startsAt and endsAt', () => {
    const actualBody = buildCreateAdminRevenuePeriodBody({ month: '2026-08' });
    expect(actualBody).toEqual({
      startsAt: '2026-08-01T00:00:00.000Z',
      endsAt: '2026-09-01T00:00:00.000Z',
    });
  });
});
