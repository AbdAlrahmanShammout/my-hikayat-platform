import { describe, expect, it } from 'vitest';

import { parsePositiveInt } from '@/lib/parse-positive-int';

describe('parsePositiveInt', () => {
  it('parses a whole positive integer', () => {
    const actualValue: number | null = parsePositiveInt('12');
    expect(actualValue).toBe(12);
  });

  it('rejects zero, padding, and partial numbers', () => {
    expect(parsePositiveInt('0')).toBeNull();
    expect(parsePositiveInt('08')).toBeNull();
    expect(parsePositiveInt('12abc')).toBeNull();
    expect(parsePositiveInt(undefined)).toBeNull();
  });
});
