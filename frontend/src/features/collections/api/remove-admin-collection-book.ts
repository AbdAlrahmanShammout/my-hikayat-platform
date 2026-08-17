import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

export type RemoveAdminCollectionBookInput = {
  readonly collectionId: number;
  readonly bookId: number;
};

/**
 * Removes a book from a collection.
 */
export async function removeAdminCollectionBook(
  input: RemoveAdminCollectionBookInput,
): Promise<components['schemas']['CollectionResponse']> {
  return requestJson<components['schemas']['CollectionResponse']>({
    path: `/admin/collections/${input.collectionId}/books/${input.bookId}`,
    method: 'DELETE',
  });
}
