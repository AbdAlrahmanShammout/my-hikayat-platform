import { describe, expect, it } from 'vitest';

import { parseAdminBooksListSearch } from '@/features/books/lib/parse-admin-books-list-search';

describe('parseAdminBooksListSearch', () => {
  it('defaults to every status and offset 0', () => {
    const actualSearch = parseAdminBooksListSearch(new URLSearchParams());
    expect(actualSearch).toEqual({ publishingStatus: undefined, offset: 0 });
  });

  it('reads a known publishingStatus and offset', () => {
    const inputParams = new URLSearchParams('publishingStatus=in_review&offset=20');
    const actualSearch = parseAdminBooksListSearch(inputParams);
    expect(actualSearch).toEqual({ publishingStatus: 'in_review', offset: 20 });
  });

  it('ignores an unknown publishingStatus', () => {
    const actualSearch = parseAdminBooksListSearch(new URLSearchParams('publishingStatus=live'));
    expect(actualSearch.publishingStatus).toBeUndefined();
  });
});
