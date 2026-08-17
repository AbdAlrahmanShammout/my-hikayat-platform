import { describe, expect, it } from 'vitest';

import { isValidInstantString } from '@/features/revenue/lib/is-valid-instant-string';

describe('isValidInstantString', () => {
  it('accepts an ISO instant', () => {
    const actualResult = isValidInstantString('2026-08-01T00:00:00.000Z');
    expect(actualResult).toBe(true);
  });

  it('rejects an empty or invalid value', () => {
    expect(isValidInstantString('')).toBe(false);
    expect(isValidInstantString('not-a-date')).toBe(false);
  });
});
