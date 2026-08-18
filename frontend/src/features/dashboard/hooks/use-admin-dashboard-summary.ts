import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getAdminDashboardSummary } from '@/features/dashboard/api/get-admin-dashboard-summary';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/dashboard/summary.
 */
export function useAdminDashboardSummary(): UseQueryResult<
  components['schemas']['GetAdminDashboardSummaryResponseDto'],
  Error
> {
  return useQuery({
    queryKey: queryKeys.admin.dashboard.summary(),
    queryFn: () => getAdminDashboardSummary(),
  });
}
