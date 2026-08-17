import { describe, expect, it } from 'vitest';

import { parseWireCents } from '@/features/revenue/lib/parse-wire-cents';

describe('parseWireCents', () => {
  it('returns a non-negative integer', () => {
    const actualCents = parseWireCents(10000);
    expect(actualCents).toBe(10000);
  });

  it('treats null, fractions, and negatives as unset', () => {
    expect(parseWireCents(null)).toBeNull();
    expect(parseWireCents(10.5)).toBeNull();
    expect(parseWireCents(-1)).toBeNull();
  });
});
