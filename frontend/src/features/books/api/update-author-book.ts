import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/author';

export type UpdateAuthorBookInput = {
  readonly bookId: number;
  readonly body: components['schemas']['UpdateBookRequestDto'];
};

/**
 * Updates book metadata. Publishing status is unchanged by this endpoint.
 */
export async function updateAuthorBook(
  input: UpdateAuthorBookInput,
): Promise<components['schemas']['BookResponse']> {
  return requestJson<components['schemas']['BookResponse']>({
    path: `/author/books/${input.bookId}`,
    method: 'PATCH',
    body: input.body,
  });
}
