import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Returns an approved unpublished book to the catalog. publishedAt becomes now.
 */
export async function republishAdminBook(
  bookId: number,
): Promise<components['schemas']['BookResponse']> {
  return requestJson<components['schemas']['BookResponse']>({
    path: `/admin/books/${bookId}/republish`,
    method: 'POST',
  });
}
