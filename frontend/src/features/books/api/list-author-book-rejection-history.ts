import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/author';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAuthorBookRejectionHistoryQuery = NonNullable<
  paths['/author/books/{id}/rejection-history']['get']['parameters']['query']
>;

/**
 * Lists book_rejected audit rows for one owned book.
 */
export async function listAuthorBookRejectionHistory(
  bookId: number,
  query: ListAuthorBookRejectionHistoryQuery = {},
): Promise<components['schemas']['GetBookRejectionHistoryResponseDto']> {
  return requestJson<components['schemas']['GetBookRejectionHistoryResponseDto']>({
    path: `/author/books/${bookId}/rejection-history${toSearchParams(query)}`,
    method: 'GET',
  });
}
