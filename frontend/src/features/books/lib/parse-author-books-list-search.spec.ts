import { describe, expect, it } from 'vitest';

import { parseAuthorBooksListSearch } from '@/features/books/lib/parse-author-books-list-search';

describe('parseAuthorBooksListSearch', () => {
  it('defaults to every status and offset 0', () => {
    const actualSearch = parseAuthorBooksListSearch(new URLSearchParams());
    expect(actualSearch).toEqual({ publishingStatus: undefined, offset: 0 });
  });

  it('reads a known publishingStatus and offset', () => {
    const inputParams = new URLSearchParams('publishingStatus=in_review&offset=20');
    const actualSearch = parseAuthorBooksListSearch(inputParams);
    expect(actualSearch).toEqual({ publishingStatus: 'in_review', offset: 20 });
  });

  it('ignores an unknown publishingStatus', () => {
    const actualSearch = parseAuthorBooksListSearch(new URLSearchParams('publishingStatus=live'));
    expect(actualSearch.publishingStatus).toBeUndefined();
  });
});
