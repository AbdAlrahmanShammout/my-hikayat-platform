import { describe, expect, it } from 'vitest';

import { formatBookRejectionReason } from '@/features/books/lib/format-book-rejection-reason';

describe('formatBookRejectionReason', () => {
  it('returns the reason text', () => {
    expect(formatBookRejectionReason('Cover art is unreadable at catalog size.')).toBe(
      'Cover art is unreadable at catalog size.',
    );
  });

  it('labels a missing reason', () => {
    expect(formatBookRejectionReason(null)).toBe('Not set');
  });
});
