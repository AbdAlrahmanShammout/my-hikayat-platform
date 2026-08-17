import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAdminPeriodEarnings,
  type ListAdminPeriodEarningsQuery,
} from '@/features/revenue/api/list-admin-period-earnings';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/revenue-periods/:id/earnings.
 */
export function useAdminPeriodEarnings(
  revenuePeriodId: number,
  query: ListAdminPeriodEarningsQuery = {},
): UseQueryResult<components['schemas']['GetAdminPeriodEarningsResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.revenuePeriods.earnings(revenuePeriodId, query),
    queryFn: () => listAdminPeriodEarnings({ revenuePeriodId, query }),
  });
}
