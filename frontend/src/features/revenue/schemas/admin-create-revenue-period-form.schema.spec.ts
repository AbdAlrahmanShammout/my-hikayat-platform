import { describe, expect, it } from 'vitest';

import { adminCreateRevenuePeriodFormSchema } from '@/features/revenue/schemas/admin-create-revenue-period-form.schema';

describe('adminCreateRevenuePeriodFormSchema', () => {
  it('accepts UTC bounds with optional pool and cut omitted', () => {
    const actualResult = adminCreateRevenuePeriodFormSchema.safeParse({
      startsAt: '2026-08-01T00:00:00.000Z',
      endsAt: '2026-09-01T00:00:00.000Z',
      platformCutPercent: '',
      poolAmountCents: '',
    });
    expect(actualResult.success).toBe(true);
  });

  it('rejects an end that is not later than start', () => {
    const actualResult = adminCreateRevenuePeriodFormSchema.safeParse({
      startsAt: '2026-09-01T00:00:00.000Z',
      endsAt: '2026-08-01T00:00:00.000Z',
      platformCutPercent: '',
      poolAmountCents: '',
    });
    expect(actualResult.success).toBe(false);
  });

  it('rejects a negative pool', () => {
    const actualResult = adminCreateRevenuePeriodFormSchema.safeParse({
      startsAt: '2026-08-01T00:00:00.000Z',
      endsAt: '2026-09-01T00:00:00.000Z',
      platformCutPercent: '',
      poolAmountCents: '-1',
    });
    expect(actualResult.success).toBe(false);
  });
});
