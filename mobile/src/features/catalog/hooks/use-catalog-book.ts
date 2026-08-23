import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getCatalogBook, type CatalogBook } from '@/features/catalog/api/get-catalog-book';

/**
 * Loads one catalog book for the detail screen.
 */
export function useCatalogBook(bookId: number | null) {
  return useQuery<CatalogBook>({
    queryKey: queryKeys.catalog.book(bookId ?? 0),
    queryFn: () => getCatalogBook(bookId as number),
    enabled: bookId !== null && Number.isFinite(bookId) && bookId > 0,
  });
}
