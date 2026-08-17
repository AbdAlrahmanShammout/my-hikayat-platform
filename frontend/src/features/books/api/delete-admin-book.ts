import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Soft-deletes a book.
 */
export async function deleteAdminBook(
  bookId: number,
): Promise<components['schemas']['BookResponse']> {
  return requestJson<components['schemas']['BookResponse']>({
    path: `/admin/books/${bookId}`,
    method: 'DELETE',
  });
}
