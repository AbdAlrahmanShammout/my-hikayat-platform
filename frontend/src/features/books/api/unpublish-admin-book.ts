import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Hides an approved live book from the catalog without changing publishingStatus.
 */
export async function unpublishAdminBook(
  bookId: number,
): Promise<components['schemas']['BookResponse']> {
  return requestJson<components['schemas']['BookResponse']>({
    path: `/admin/books/${bookId}/unpublish`,
    method: 'POST',
  });
}
