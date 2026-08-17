import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

export type UpdateAdminBookInput = {
  readonly bookId: number;
  readonly body: components['schemas']['UpdateBookRequestDto'];
};

/**
 * Updates book metadata. Publishing status is unchanged by this endpoint.
 */
export async function updateAdminBook(
  input: UpdateAdminBookInput,
): Promise<components['schemas']['BookResponse']> {
  return requestJson<components['schemas']['BookResponse']>({
    path: `/admin/books/${input.bookId}`,
    method: 'PATCH',
    body: input.body,
  });
}
