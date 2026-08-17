import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getAdminBook } from '@/features/books/api/get-admin-book';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/books/:id.
 */
export function useAdminBook(
  bookId: number,
): UseQueryResult<components['schemas']['BookResponse'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.books.detail(bookId),
    queryFn: () => getAdminBook(bookId),
  });
}
