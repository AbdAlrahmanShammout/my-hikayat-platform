import { describe, expect, it } from 'vitest';

import { parseAuthorBookRejectionHistorySearch } from '@/features/books/lib/parse-author-book-rejection-history-search';

describe('parseAuthorBookRejectionHistorySearch', () => {
  it('defaults to offset 0', () => {
    expect(parseAuthorBookRejectionHistorySearch(new URLSearchParams())).toEqual({ offset: 0 });
  });

  it('reads rejectionOffset', () => {
    expect(
      parseAuthorBookRejectionHistorySearch(new URLSearchParams('rejectionOffset=20')),
    ).toEqual({
      offset: 20,
    });
  });
});
