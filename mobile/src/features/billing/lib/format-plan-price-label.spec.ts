import { formatPlanPriceLabel } from '@/features/billing/lib/format-plan-price-label';

describe('formatPlanPriceLabel', () => {
  it('formats amount cents with currency', () => {
    const actual = formatPlanPriceLabel(999, 'usd');
    expect(actual.length).toBeGreaterThan(0);
    expect(actual).toMatch(/9\.99|9,99/);
  });

  it('returns empty when amount is missing', () => {
    expect(formatPlanPriceLabel(null, 'usd')).toBe('');
  });
});
