import { describe, expect, it } from 'vitest';

import { formatCents } from '@/lib/format-cents';

describe('formatCents', () => {
  it('formats a dollar amount from integer cents', () => {
    const actualLabel = formatCents(10000);
    expect(actualLabel).toBe('$100.00');
  });

  it('formats a single cent', () => {
    const actualLabel = formatCents(1);
    expect(actualLabel).toBe('$0.01');
  });
});
