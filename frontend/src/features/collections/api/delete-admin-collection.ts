import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Soft-deletes an editorial collection.
 */
export async function deleteAdminCollection(
  collectionId: number,
): Promise<components['schemas']['CollectionResponse']> {
  return requestJson<components['schemas']['CollectionResponse']>({
    path: `/admin/collections/${collectionId}`,
    method: 'DELETE',
  });
}
