import { describe, expect, it } from 'vitest';

import { adminCreateRevenuePeriodFormSchema } from '@/features/revenue/schemas/admin-create-revenue-period-form.schema';

describe('adminCreateRevenuePeriodFormSchema', () => {
  it('accepts a calendar month', () => {
    const actualResult = adminCreateRevenuePeriodFormSchema.safeParse({ month: '2026-08' });
    expect(actualResult.success).toBe(true);
  });

  it('rejects a month number outside 1 through 12', () => {
    const actualResult = adminCreateRevenuePeriodFormSchema.safeParse({ month: '2026-13' });
    expect(actualResult.success).toBe(false);
  });
});
