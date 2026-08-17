import { describe, expect, it } from 'vitest';

import { formatPoolAmountLabel } from '@/features/revenue/lib/format-pool-amount-label';

describe('formatPoolAmountLabel', () => {
  it('labels an unset pool', () => {
    const actualLabel = formatPoolAmountLabel(null);
    expect(actualLabel).toBe('Not set');
  });

  it('shows USD and integer cents', () => {
    const actualLabel = formatPoolAmountLabel(10000);
    expect(actualLabel).toBe('$100.00 (10000 cents)');
  });
});
