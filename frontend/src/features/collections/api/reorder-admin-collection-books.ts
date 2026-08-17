import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

export type ReorderAdminCollectionBooksInput = {
  readonly collectionId: number;
  readonly bookIds: readonly number[];
};

/**
 * Replaces editorial order. The payload must be the current membership set.
 */
export async function reorderAdminCollectionBooks(
  input: ReorderAdminCollectionBooksInput,
): Promise<components['schemas']['CollectionResponse']> {
  return requestJson<components['schemas']['CollectionResponse']>({
    path: `/admin/collections/${input.collectionId}/reorder`,
    method: 'POST',
    body: { bookIds: [...input.bookIds] },
  });
}
