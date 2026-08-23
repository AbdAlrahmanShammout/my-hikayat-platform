import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listCatalogBooks,
  type CatalogSort,
  type GetBooksResponse,
} from '@/features/catalog/api/list-catalog-books';

export type UseCatalogBooksInput = {
  readonly limit?: number;
  readonly offset?: number;
  readonly categoryId?: number;
  readonly sort?: CatalogSort;
};

/**
 * Loads the catalog book list for the Home browse surface.
 */
export function useCatalogBooks(input: UseCatalogBooksInput = {}) {
  return useQuery<GetBooksResponse>({
    queryKey: queryKeys.catalog.books(input),
    queryFn: () => listCatalogBooks(input),
  });
}
