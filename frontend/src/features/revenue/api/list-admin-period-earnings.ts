import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/admin';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAdminPeriodEarningsQuery = NonNullable<
  paths['/admin/revenue-periods/{id}/earnings']['get']['parameters']['query']
>;

export type ListAdminPeriodEarningsInput = {
  readonly revenuePeriodId: number;
  readonly query?: ListAdminPeriodEarningsQuery;
};

/**
 * Lists calculated book earnings for a revenue period.
 */
export async function listAdminPeriodEarnings(
  input: ListAdminPeriodEarningsInput,
): Promise<components['schemas']['GetAdminPeriodEarningsResponseDto']> {
  return requestJson<components['schemas']['GetAdminPeriodEarningsResponseDto']>({
    path: `/admin/revenue-periods/${input.revenuePeriodId}/earnings${toSearchParams(input.query ?? {})}`,
    method: 'GET',
  });
}
