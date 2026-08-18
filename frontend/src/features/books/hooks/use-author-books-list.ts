import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAuthorBooks,
  type ListAuthorBooksQuery,
} from '@/features/books/api/list-author-books';
import type { components } from '@/generated/author';

/**
 * Server-state hook for GET /author/books.
 */
export function useAuthorBooksList(
  query: ListAuthorBooksQuery = {},
): UseQueryResult<components['schemas']['GetBooksResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.author.books.list(query),
    queryFn: () => listAuthorBooks(query),
  });
}
