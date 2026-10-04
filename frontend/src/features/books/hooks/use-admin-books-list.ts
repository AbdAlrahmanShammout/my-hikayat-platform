import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAdminBooks,
  type AdminBooksListResponse,
  type ListAdminBooksQuery,
} from '@/features/books/api/list-admin-books';

/**
 * Server-state hook for GET /admin/books.
 * ownerId is a server query. The client does not filter the catalog.
 */
export function useAdminBooksList(
  query: ListAdminBooksQuery = {},
): UseQueryResult<AdminBooksListResponse, Error> {
  return useQuery({
    queryKey: queryKeys.admin.books.list(query),
    queryFn: () => listAdminBooks(query),
  });
}
