import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/author';

/**
 * Submits an owned book for editorial review. Processing may run first on the API.
 */
export async function submitAuthorBookForReview(
  bookId: number,
): Promise<components['schemas']['BookResponse']> {
  return requestJson<components['schemas']['BookResponse']>({
    path: `/author/books/${bookId}/submit-for-review`,
    method: 'POST',
  });
}
