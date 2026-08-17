import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAdminRevenuePeriods,
  type ListAdminRevenuePeriodsQuery,
} from '@/features/revenue/api/list-admin-revenue-periods';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/revenue-periods.
 */
export function useAdminRevenuePeriodsList(
  query: ListAdminRevenuePeriodsQuery = {},
): UseQueryResult<components['schemas']['GetRevenuePeriodsResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.revenuePeriods.list(query),
    queryFn: () => listAdminRevenuePeriods(query),
  });
}
