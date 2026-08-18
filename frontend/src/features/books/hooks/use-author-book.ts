import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getAuthorBook } from '@/features/books/api/get-author-book';
import type { components } from '@/generated/author';

/**
 * Server-state hook for GET /author/books/:id.
 */
export function useAuthorBook(
  bookId: number,
): UseQueryResult<components['schemas']['BookResponse'], Error> {
  return useQuery({
    queryKey: queryKeys.author.books.detail(bookId),
    queryFn: () => getAuthorBook(bookId),
  });
}
