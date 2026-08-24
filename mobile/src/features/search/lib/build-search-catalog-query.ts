import type { SearchCatalogBooksInput, SearchCatalogField } from '@/features/search/api/search-catalog-books';

export type BuildSearchCatalogQueryInput = {
  readonly field: SearchCatalogField;
  readonly query: string;
  readonly limit?: number;
  readonly offset?: number;
};

/**
 * Maps a single kids-friendly search box + field chip onto the backend query.
 * Backend ANDs title/author/publisher when multiple are set, so only one field is sent.
 */
export function buildSearchCatalogQuery(
  input: BuildSearchCatalogQueryInput,
): SearchCatalogBooksInput | null {
  const normalizedQuery: string = input.query.trim().replace(/\s+/g, ' ');
  if (normalizedQuery.length === 0) {
    return null;
  }
  const params: SearchCatalogBooksInput = {
    limit: input.limit,
    offset: input.offset,
  };
  if (input.field === 'title') {
    return { ...params, title: normalizedQuery };
  }
  if (input.field === 'author') {
    return { ...params, author: normalizedQuery };
  }
  return { ...params, publisher: normalizedQuery };
}
