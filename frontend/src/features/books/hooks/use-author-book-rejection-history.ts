import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAuthorBookRejectionHistory,
  type ListAuthorBookRejectionHistoryQuery,
} from '@/features/books/api/list-author-book-rejection-history';
import type { components } from '@/generated/author';

/**
 * Server-state hook for GET /author/books/:id/rejection-history.
 */
export function useAuthorBookRejectionHistory(
  bookId: number,
  query: ListAuthorBookRejectionHistoryQuery = {},
): UseQueryResult<components['schemas']['GetBookRejectionHistoryResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.author.books.rejectionHistory(bookId, query),
    queryFn: () => listAuthorBookRejectionHistory(bookId, query),
  });
}
