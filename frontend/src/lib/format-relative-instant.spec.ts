import { describe, expect, it } from 'vitest';

import { formatRelativeInstant } from '@/lib/format-relative-instant';

describe('formatRelativeInstant', () => {
  const now = new Date('2026-09-08T12:00:00.000Z');

  it('formats hours ago from a known instant', () => {
    const actualLabel = formatRelativeInstant('2026-09-08T10:00:00.000Z', now);
    expect(actualLabel).toContain('2');
    expect(actualLabel.toLowerCase()).toContain('hour');
  });

  it('returns a fallback when the instant is missing', () => {
    expect(formatRelativeInstant(null, now)).toBe('Unknown date');
  });
});
