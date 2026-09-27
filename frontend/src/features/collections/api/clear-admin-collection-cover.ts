import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Removes the stored collection cover.
 */
export async function clearAdminCollectionCover(
  collectionId: number,
): Promise<components['schemas']['CollectionResponse']> {
  return requestJson<components['schemas']['CollectionResponse']>({
    path: `/admin/collections/${collectionId}/cover`,
    method: 'DELETE',
  });
}
