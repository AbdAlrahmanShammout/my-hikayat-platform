import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Creates an editorial collection. Optional bookIds are the initial order.
 */
export async function createAdminCollection(
  body: components['schemas']['CreateCollectionRequestDto'],
): Promise<components['schemas']['CollectionResponse']> {
  return requestJson<components['schemas']['CollectionResponse']>({
    path: '/admin/collections',
    method: 'POST',
    body,
  });
}
