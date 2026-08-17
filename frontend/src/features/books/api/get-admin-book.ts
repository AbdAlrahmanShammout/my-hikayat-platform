import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Loads one book for administrative management.
 */
export async function getAdminBook(
  bookId: number,
): Promise<components['schemas']['BookResponse']> {
  return requestJson<components['schemas']['BookResponse']>({
    path: `/admin/books/${bookId}`,
    method: 'GET',
  });
}
