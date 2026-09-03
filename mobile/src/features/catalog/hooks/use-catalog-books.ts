import { useInfiniteQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listCatalogBooks,
  type CatalogSort,
} from '@/features/catalog/api/list-catalog-books';
import {
  CATALOG_PAGE_SIZE,
  resolveNextCatalogPageOffset,
} from '@/features/catalog/lib/catalog-pagination';

export type UseCatalogBooksInput = {
  readonly categoryId?: number;
  readonly sort?: CatalogSort;
  readonly pageSize?: number;
};

/**
 * Loads catalog books with limit/offset infinite paging for the Home browse surface.
 */
export function useCatalogBooks(input: UseCatalogBooksInput = {}) {
  const pageSize: number = input.pageSize ?? CATALOG_PAGE_SIZE;
  return useInfiniteQuery({
    queryKey: queryKeys.catalog.books({
      categoryId: input.categoryId,
      sort: input.sort,
    }),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      listCatalogBooks({
        limit: pageSize,
        offset: pageParam,
        categoryId: input.categoryId,
        sort: input.sort,
      }),
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      resolveNextCatalogPageOffset({
        lastPageOffset: lastPageParam,
        lastPageBookCount: lastPage.books.length,
        total: lastPage.total,
      }),
  });
}
