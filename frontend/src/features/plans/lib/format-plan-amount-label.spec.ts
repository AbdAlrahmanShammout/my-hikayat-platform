import { describe, expect, it } from 'vitest';

import { formatPlanAmountLabel } from '@/features/plans/lib/format-plan-amount-label';

describe('formatPlanAmountLabel', () => {
  it('formats amount cents with currency', () => {
    const actual: string = formatPlanAmountLabel(999, 'usd');
    expect(actual.length).toBeGreaterThan(0);
    expect(actual).toMatch(/9\.99|9,99/);
  });

  it('returns dash when amount is missing', () => {
    expect(formatPlanAmountLabel(null, 'usd')).toBe('—');
  });
});
