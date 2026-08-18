import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/author';

/**
 * Loads one book owned by the authenticated publisher (or any book for an admin).
 */
export async function getAuthorBook(
  bookId: number,
): Promise<components['schemas']['BookResponse']> {
  return requestJson<components['schemas']['BookResponse']>({
    path: `/author/books/${bookId}`,
    method: 'GET',
  });
}
