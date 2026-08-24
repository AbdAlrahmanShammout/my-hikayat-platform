import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  searchCatalogBooks,
  type GetSearchBooksResponse,
  type SearchCatalogBooksInput,
} from '@/features/search/api/search-catalog-books';

export type UseSearchCatalogBooksInput = SearchCatalogBooksInput & {
  readonly enabled?: boolean;
};

/**
 * Loads catalog metadata search results for the search screen.
 */
export function useSearchCatalogBooks(input: UseSearchCatalogBooksInput) {
  const { enabled = true, ...searchInput } = input;
  return useQuery<GetSearchBooksResponse>({
    queryKey: queryKeys.search.books(searchInput),
    queryFn: () => searchCatalogBooks(searchInput),
    enabled,
  });
}
