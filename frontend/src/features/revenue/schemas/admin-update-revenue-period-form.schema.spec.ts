import { describe, expect, it } from 'vitest';

import { adminUpdateRevenuePeriodFormSchema } from '@/features/revenue/schemas/admin-update-revenue-period-form.schema';

describe('adminUpdateRevenuePeriodFormSchema', () => {
  it('accepts a cut and pool', () => {
    const actualResult = adminUpdateRevenuePeriodFormSchema.safeParse({
      platformCutPercent: 30,
      poolAmountCents: 10000,
    });
    expect(actualResult.success).toBe(true);
  });

  it('accepts an omitted pool', () => {
    const actualResult = adminUpdateRevenuePeriodFormSchema.safeParse({
      platformCutPercent: 30,
    });
    expect(actualResult.success).toBe(true);
  });

  it('rejects a cut above 100', () => {
    const actualResult = adminUpdateRevenuePeriodFormSchema.safeParse({
      platformCutPercent: 101,
      poolAmountCents: 0,
    });
    expect(actualResult.success).toBe(false);
  });
});
