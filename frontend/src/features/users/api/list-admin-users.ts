import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/admin';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAdminUsersQuery = NonNullable<
  paths['/admin/users']['get']['parameters']['query']
>;

/**
 * Lists users for the admin audience. `total` is the account count.
 */
export async function listAdminUsers(
  query: ListAdminUsersQuery = {},
): Promise<components['schemas']['GetUsersResponseDto']> {
  return requestJson<components['schemas']['GetUsersResponseDto']>({
    path: `/admin/users${toSearchParams(query)}`,
    method: 'GET',
  });
}
