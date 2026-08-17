import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAdminBookRejectionHistory,
  type ListAdminBookRejectionHistoryQuery,
} from '@/features/books/api/list-admin-book-rejection-history';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/books/:id/rejection-history.
 */
export function useAdminBookRejectionHistory(
  bookId: number,
  query: ListAdminBookRejectionHistoryQuery = {},
): UseQueryResult<components['schemas']['GetBookRejectionHistoryResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.books.rejectionHistory(bookId, query),
    queryFn: () => listAdminBookRejectionHistory(bookId, query),
  });
}
