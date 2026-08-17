import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/admin';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAdminSubscriptionsQuery = NonNullable<
  paths['/admin/subscriptions']['get']['parameters']['query']
>;

/**
 * Lists subscriptions for the admin audience. `total` is the subscription count.
 */
export async function listAdminSubscriptions(
  query: ListAdminSubscriptionsQuery = {},
): Promise<components['schemas']['GetSubscriptionsResponseDto']> {
  return requestJson<components['schemas']['GetSubscriptionsResponseDto']>({
    path: `/admin/subscriptions${toSearchParams(query)}`,
    method: 'GET',
  });
}
