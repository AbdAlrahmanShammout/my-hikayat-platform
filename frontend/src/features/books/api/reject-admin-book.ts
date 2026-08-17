import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

export type RejectAdminBookInput = {
  readonly bookId: number;
  readonly body: components['schemas']['RejectBookRequestDto'];
};

/**
 * Rejects an in-review book. The reason is stored on the book_rejected audit record.
 */
export async function rejectAdminBook(
  input: RejectAdminBookInput,
): Promise<components['schemas']['BookResponse']> {
  return requestJson<components['schemas']['BookResponse']>({
    path: `/admin/books/${input.bookId}/reject`,
    method: 'POST',
    body: input.body,
  });
}
