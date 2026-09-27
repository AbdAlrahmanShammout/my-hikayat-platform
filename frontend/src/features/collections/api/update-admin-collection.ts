import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

export type UpdateAdminCollectionInput = {
  readonly collectionId: number;
  readonly body: components['schemas']['UpdateCollectionRequestDto'];
};

/**
 * Updates an editorial collection title and description.
 */
export async function updateAdminCollection(
  input: UpdateAdminCollectionInput,
): Promise<components['schemas']['CollectionResponse']> {
  return requestJson<components['schemas']['CollectionResponse']>({
    path: `/admin/collections/${input.collectionId}`,
    method: 'PATCH',
    body: input.body,
  });
}
