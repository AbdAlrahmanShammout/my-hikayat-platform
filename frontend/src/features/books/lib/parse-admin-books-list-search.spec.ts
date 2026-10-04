import { describe, expect, it } from 'vitest';

import {
  EMPTY_ADMIN_BOOKS_LIST_SEARCH,
  parseAdminBooksListSearch,
} from '@/features/books/lib/parse-admin-books-list-search';

describe('parseAdminBooksListSearch', () => {
  it('defaults to every status and offset 0', () => {
    const actualSearch = parseAdminBooksListSearch(new URLSearchParams());
    expect(actualSearch).toEqual(EMPTY_ADMIN_BOOKS_LIST_SEARCH);
  });

  it('reads a known publishingStatus and offset', () => {
    const inputParams = new URLSearchParams('publishingStatus=in_review&offset=20');
    const actualSearch = parseAdminBooksListSearch(inputParams);
    expect(actualSearch).toEqual({
      ...EMPTY_ADMIN_BOOKS_LIST_SEARCH,
      publishingStatuses: ['in_review'],
      offset: 20,
    });
  });

  it('ignores an unknown publishingStatus and a one-character keyword', () => {
    const actualSearch = parseAdminBooksListSearch(
      new URLSearchParams('publishingStatus=live&q=a'),
    );
    expect(actualSearch.publishingStatuses).toEqual([]);
    expect(actualSearch.q).toBeUndefined();
  });

  it('keeps repeated catalog filters', () => {
    const inputParams = new URLSearchParams(
      'categoryId=4&categoryId=9&catalogVisible=true&authorName=Ada',
    );
    const actualSearch = parseAdminBooksListSearch(inputParams);
    expect(actualSearch.categoryIds).toEqual([4, 9]);
    expect(actualSearch.catalogVisible).toBe(true);
    expect(actualSearch.authorName).toBe('Ada');
  });
});
