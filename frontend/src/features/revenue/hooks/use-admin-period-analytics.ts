import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAdminPeriodAnalytics,
  type ListAdminPeriodAnalyticsQuery,
} from '@/features/revenue/api/list-admin-period-analytics';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/revenue-periods/:id/analytics.
 */
export function useAdminPeriodAnalytics(
  revenuePeriodId: number,
  query: ListAdminPeriodAnalyticsQuery = {},
): UseQueryResult<components['schemas']['GetAdminPeriodAnalyticsResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.revenuePeriods.analytics(revenuePeriodId, query),
    queryFn: () => listAdminPeriodAnalytics({ revenuePeriodId, query }),
  });
}
