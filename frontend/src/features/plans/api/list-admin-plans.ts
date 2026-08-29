import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/admin';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAdminPlansQuery = NonNullable<paths['/admin/plans']['get']['parameters']['query']>;

/**
 * Lists subscription catalog plans for the admin audience.
 */
export async function listAdminPlans(
  query: ListAdminPlansQuery = {},
): Promise<components['schemas']['GetPlansResponseDto']> {
  return requestJson<components['schemas']['GetPlansResponseDto']>({
    path: `/admin/plans${toSearchParams(query)}`,
    method: 'GET',
  });
}
