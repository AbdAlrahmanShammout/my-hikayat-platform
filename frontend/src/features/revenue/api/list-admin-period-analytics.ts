import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/admin';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAdminPeriodAnalyticsQuery = NonNullable<
  paths['/admin/revenue-periods/{id}/analytics']['get']['parameters']['query']
>;

export type ListAdminPeriodAnalyticsInput = {
  readonly revenuePeriodId: number;
  readonly query?: ListAdminPeriodAnalyticsQuery;
};

/**
 * Lists weighted book engagement for a revenue period.
 */
export async function listAdminPeriodAnalytics(
  input: ListAdminPeriodAnalyticsInput,
): Promise<components['schemas']['GetAdminPeriodAnalyticsResponseDto']> {
  return requestJson<components['schemas']['GetAdminPeriodAnalyticsResponseDto']>({
    path: `/admin/revenue-periods/${input.revenuePeriodId}/analytics${toSearchParams(input.query ?? {})}`,
    method: 'GET',
  });
}
