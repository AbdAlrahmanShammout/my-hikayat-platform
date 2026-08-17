import { describe, expect, it } from 'vitest';

import { buildAdminRevenuePeriodUpdateBody } from '@/features/revenue/lib/build-admin-revenue-period-update-body';
import type { components } from '@/generated/admin';

function createInputPeriod(
  overrides: Partial<components['schemas']['RevenuePeriodResponse']> = {},
): components['schemas']['RevenuePeriodResponse'] {
  return {
    id: 1,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    startsAt: '2026-08-01T00:00:00.000Z',
    endsAt: '2026-09-01T00:00:00.000Z',
    status: 'open',
    platformCutPercent: 30,
    poolAmountCents: 10000,
    ...overrides,
  };
}

describe('buildAdminRevenuePeriodUpdateBody', () => {
  it('returns null when pool and cut are unchanged', () => {
    const actualBody = buildAdminRevenuePeriodUpdateBody({
      period: createInputPeriod(),
      values: { platformCutPercent: 30, poolAmountCents: 10000 },
    });
    expect(actualBody).toBeNull();
  });

  it('includes only the changed pool amount', () => {
    const actualBody = buildAdminRevenuePeriodUpdateBody({
      period: createInputPeriod(),
      values: { platformCutPercent: 30, poolAmountCents: 5000 },
    });
    expect(actualBody).toEqual({ poolAmountCents: 5000 });
  });

  it('omits platform cut changes when the period is closed', () => {
    const actualBody = buildAdminRevenuePeriodUpdateBody({
      period: createInputPeriod({ status: 'closed' }),
      values: { platformCutPercent: 10, poolAmountCents: 10000 },
    });
    expect(actualBody).toBeNull();
  });

  it('allows a pool change on a closed period', () => {
    const actualBody = buildAdminRevenuePeriodUpdateBody({
      period: createInputPeriod({ status: 'closed' }),
      values: { platformCutPercent: 30, poolAmountCents: 900 },
    });
    expect(actualBody).toEqual({ poolAmountCents: 900 });
  });
});
