import { describe, expect, it } from 'vitest';

import { hasWireInstant } from '@/lib/has-wire-instant';

describe('hasWireInstant', () => {
  it('treats null, undefined, and blank strings as missing', () => {
    expect(hasWireInstant(null)).toBe(false);
    expect(hasWireInstant(undefined)).toBe(false);
    expect(hasWireInstant('')).toBe(false);
    expect(hasWireInstant('   ')).toBe(false);
  });

  it('treats ISO strings as present', () => {
    expect(hasWireInstant('2026-08-17T01:00:00.000Z')).toBe(true);
  });
});
