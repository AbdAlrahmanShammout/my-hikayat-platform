import { describe, expect, it } from 'vitest';

import { formatUserEmailLabel } from '@/lib/format-user-email-label';

describe('formatUserEmailLabel', () => {
  it('returns the related email when present', () => {
    const actualLabel: string = formatUserEmailLabel({
      userId: 5,
      user: { email: 'reader@example.com' },
    });
    expect(actualLabel).toBe('reader@example.com');
  });

  it('falls back to the user id when the relation is missing', () => {
    const actualLabel: string = formatUserEmailLabel({ userId: 5 });
    expect(actualLabel).toBe('User #5');
  });
});
