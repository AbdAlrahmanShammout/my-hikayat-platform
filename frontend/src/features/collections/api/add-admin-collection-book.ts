import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

export type AddAdminCollectionBookInput = {
  readonly collectionId: number;
  readonly bookId: number;
};

/**
 * Appends a book to a collection. Unpublished books are allowed in admin membership.
 */
export async function addAdminCollectionBook(
  input: AddAdminCollectionBookInput,
): Promise<components['schemas']['CollectionResponse']> {
  return requestJson<components['schemas']['CollectionResponse']>({
    path: `/admin/collections/${input.collectionId}/books`,
    method: 'POST',
    body: { bookId: input.bookId },
  });
}
