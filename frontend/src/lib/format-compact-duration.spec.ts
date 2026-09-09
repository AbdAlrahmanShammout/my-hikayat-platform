import { describe, expect, it } from 'vitest';

import { formatCompactDurationMs } from '@/lib/format-compact-duration';

describe('formatCompactDurationMs', () => {
  it('formats whole days', () => {
    expect(formatCompactDurationMs(23 * 24 * 60 * 60 * 1000)).toBe('23 days');
    expect(formatCompactDurationMs(24 * 60 * 60 * 1000)).toBe('1 day');
  });

  it('formats hours and minutes', () => {
    expect(formatCompactDurationMs(2 * 60 * 60 * 1000)).toBe('2 hours');
    expect(formatCompactDurationMs(12 * 60 * 1000)).toBe('12 min');
  });

  it('returns 0 min for empty or invalid values', () => {
    expect(formatCompactDurationMs(0)).toBe('0 min');
    expect(formatCompactDurationMs(-10)).toBe('0 min');
  });
});
