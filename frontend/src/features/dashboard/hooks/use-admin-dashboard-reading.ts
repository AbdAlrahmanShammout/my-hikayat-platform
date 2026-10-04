import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  getAdminDashboardReading,
  type AdminDashboardReading,
  type AdminDashboardReadingQuery,
} from '@/features/dashboard/api/get-admin-dashboard-reading';

/**
 * Server-state hook for GET /admin/dashboard/reading.
 */
export function useAdminDashboardReading(
  query: AdminDashboardReadingQuery,
): UseQueryResult<AdminDashboardReading, Error> {
  return useQuery({
    queryKey: queryKeys.admin.dashboard.reading(query),
    queryFn: () => getAdminDashboardReading(query),
  });
}
