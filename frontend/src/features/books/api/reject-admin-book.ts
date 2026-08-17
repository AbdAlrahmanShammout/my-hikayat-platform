import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Rejects an in-review book. The current contract accepts no reason body.
 */
export async function rejectAdminBook(
  bookId: number,
): Promise<components['schemas']['BookResponse']> {
  return requestJson<components['schemas']['BookResponse']>({
    path: `/admin/books/${bookId}/reject`,
    method: 'POST',
  });
}
