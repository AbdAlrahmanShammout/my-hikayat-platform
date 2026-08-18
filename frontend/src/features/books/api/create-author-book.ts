import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/author';

/**
 * Creates a book owned by the authenticated publisher.
 */
export async function createAuthorBook(
  body: components['schemas']['CreateBookRequestDto'],
): Promise<components['schemas']['BookResponse']> {
  return requestJson<components['schemas']['BookResponse']>({
    path: '/author/books',
    method: 'POST',
    body,
  });
}
