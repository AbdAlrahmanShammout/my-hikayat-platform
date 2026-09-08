import { describe, expect, it } from 'vitest';

import { formatBookTitleLabel } from '@/lib/format-book-title-label';

describe('formatBookTitleLabel', () => {
  it('returns the related title when present', () => {
    const actualLabel: string = formatBookTitleLabel({
      bookId: 8,
      book: { title: 'The Last Lighthouse' },
    });
    expect(actualLabel).toBe('The Last Lighthouse');
  });

  it('falls back to the book id when the relation is missing', () => {
    const actualLabel: string = formatBookTitleLabel({ bookId: 8 });
    expect(actualLabel).toBe('Book #8');
  });
});
