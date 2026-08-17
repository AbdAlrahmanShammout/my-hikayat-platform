import { describe, expect, it } from 'vitest';

import { parseAdminBookRejectionHistorySearch } from '@/features/books/lib/parse-admin-book-rejection-history-search';

describe('parseAdminBookRejectionHistorySearch', () => {
  it('defaults to offset 0', () => {
    expect(parseAdminBookRejectionHistorySearch(new URLSearchParams())).toEqual({ offset: 0 });
  });

  it('reads rejectionOffset', () => {
    expect(parseAdminBookRejectionHistorySearch(new URLSearchParams('rejectionOffset=20'))).toEqual(
      {
        offset: 20,
      },
    );
  });
});
