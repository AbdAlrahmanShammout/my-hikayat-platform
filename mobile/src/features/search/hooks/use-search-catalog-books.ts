import { useInfiniteQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { searchCatalogBooks } from '@/features/search/api/search-catalog-books';
import {
  CATALOG_PAGE_SIZE,
  resolveNextCatalogPageOffset,
} from '@/features/catalog/lib/catalog-pagination';

export type UseSearchCatalogBooksInput = {
  readonly title?: string;
  readonly author?: string;
  readonly publisher?: string;
  readonly pageSize?: number;
  readonly enabled?: boolean;
};

/**
 * Loads catalog metadata search results with limit/offset infinite paging.
 */
export function useSearchCatalogBooks(input: UseSearchCatalogBooksInput) {
  const { enabled = true, pageSize = CATALOG_PAGE_SIZE, ...searchFilters } = input;
  return useInfiniteQuery({
    queryKey: queryKeys.search.books(searchFilters),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      searchCatalogBooks({
        ...searchFilters,
        limit: pageSize,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      resolveNextCatalogPageOffset({
        lastPageOffset: lastPageParam,
        lastPageBookCount: lastPage.books.length,
        total: lastPage.total,
      }),
    enabled,
  });
}
