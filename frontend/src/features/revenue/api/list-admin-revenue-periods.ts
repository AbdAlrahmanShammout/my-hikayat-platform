import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/admin';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAdminRevenuePeriodsQuery = NonNullable<
  paths['/admin/revenue-periods']['get']['parameters']['query']
>;

/**
 * Lists revenue periods. `total` is the period count from the API.
 */
export async function listAdminRevenuePeriods(
  query: ListAdminRevenuePeriodsQuery = {},
): Promise<components['schemas']['GetRevenuePeriodsResponseDto']> {
  return requestJson<components['schemas']['GetRevenuePeriodsResponseDto']>({
    path: `/admin/revenue-periods${toSearchParams(query)}`,
    method: 'GET',
  });
}
