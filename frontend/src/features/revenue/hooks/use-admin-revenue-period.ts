import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getAdminRevenuePeriod } from '@/features/revenue/api/get-admin-revenue-period';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/revenue-periods/:id.
 */
export function useAdminRevenuePeriod(
  revenuePeriodId: number,
): UseQueryResult<components['schemas']['RevenuePeriodResponse'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.revenuePeriods.detail(revenuePeriodId),
    queryFn: () => getAdminRevenuePeriod(revenuePeriodId),
  });
}
