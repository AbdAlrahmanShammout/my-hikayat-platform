import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Approves an in-review book. The API sets publishedAt to now.
 */
export async function approveAdminBook(
  bookId: number,
): Promise<components['schemas']['BookResponse']> {
  return requestJson<components['schemas']['BookResponse']>({
    path: `/admin/books/${bookId}/approve`,
    method: 'POST',
  });
}
