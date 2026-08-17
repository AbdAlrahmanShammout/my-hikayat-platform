import { describe, expect, it } from 'vitest';

import { buildCreateAdminRevenuePeriodBody } from '@/features/revenue/lib/build-create-admin-revenue-period-body';

describe('buildCreateAdminRevenuePeriodBody', () => {
  it('omits empty optional fields', () => {
    const actualBody = buildCreateAdminRevenuePeriodBody({
      startsAt: '2026-08-01T00:00:00.000Z',
      endsAt: '2026-09-01T00:00:00.000Z',
      platformCutPercent: '',
      poolAmountCents: '',
    });
    expect(actualBody).toEqual({
      startsAt: '2026-08-01T00:00:00.000Z',
      endsAt: '2026-09-01T00:00:00.000Z',
    });
  });

  it('includes optional cut and pool when set', () => {
    const actualBody = buildCreateAdminRevenuePeriodBody({
      startsAt: '2026-08-01T00:00:00.000Z',
      endsAt: '2026-09-01T00:00:00.000Z',
      platformCutPercent: 30,
      poolAmountCents: 10000,
    });
    expect(actualBody).toEqual({
      startsAt: '2026-08-01T00:00:00.000Z',
      endsAt: '2026-09-01T00:00:00.000Z',
      platformCutPercent: 30,
      poolAmountCents: 10000,
    });
  });
});
