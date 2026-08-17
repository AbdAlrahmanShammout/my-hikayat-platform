import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAdminBooks,
  type ListAdminBooksQuery,
} from '@/features/books/api/list-admin-books';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/books.
 */
export function useAdminBooksList(
  query: ListAdminBooksQuery = {},
): UseQueryResult<components['schemas']['GetBooksResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.books.list(query),
    queryFn: () => listAdminBooks(query),
  });
}
