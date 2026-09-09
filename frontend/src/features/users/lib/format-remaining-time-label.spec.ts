import { describe, expect, it } from 'vitest';

import { formatRemainingTimeLabel } from '@/features/users/lib/format-remaining-time-label';

describe('formatRemainingTimeLabel', () => {
  it('returns null when the API sent no remaining time', () => {
    expect(formatRemainingTimeLabel(null)).toBeNull();
    expect(formatRemainingTimeLabel(undefined)).toBeNull();
  });

  it('labels an ended period as expired', () => {
    expect(formatRemainingTimeLabel(0)).toBe('Expired');
  });

  it('labels a positive remaining duration', () => {
    expect(formatRemainingTimeLabel(23 * 24 * 60 * 60 * 1000)).toBe('23 days remaining');
  });
});
