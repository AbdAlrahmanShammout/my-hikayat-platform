import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/admin';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAdminCollectionsQuery = NonNullable<
  paths['/admin/collections']['get']['parameters']['query']
>;

/**
 * Lists editorial collections for the admin audience.
 */
export async function listAdminCollections(
  query: ListAdminCollectionsQuery = {},
): Promise<components['schemas']['GetCollectionsResponseDto']> {
  return requestJson<components['schemas']['GetCollectionsResponseDto']>({
    path: `/admin/collections${toSearchParams(query)}`,
    method: 'GET',
  });
}
