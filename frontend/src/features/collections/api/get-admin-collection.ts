import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Loads one editorial collection.
 */
export async function getAdminCollection(
  collectionId: number,
): Promise<components['schemas']['CollectionResponse']> {
  return requestJson<components['schemas']['CollectionResponse']>({
    path: `/admin/collections/${collectionId}`,
    method: 'GET',
  });
}
