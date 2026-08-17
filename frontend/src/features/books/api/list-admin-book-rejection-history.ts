import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/admin';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAdminBookRejectionHistoryQuery = NonNullable<
  paths['/admin/books/{id}/rejection-history']['get']['parameters']['query']
>;

/**
 * Lists book_rejected audit rows for one book.
 */
export async function listAdminBookRejectionHistory(
  bookId: number,
  query: ListAdminBookRejectionHistoryQuery = {},
): Promise<components['schemas']['GetBookRejectionHistoryResponseDto']> {
  return requestJson<components['schemas']['GetBookRejectionHistoryResponseDto']>({
    path: `/admin/books/${bookId}/rejection-history${toSearchParams(query)}`,
    method: 'GET',
  });
}
