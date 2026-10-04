import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  getAdminPublisherSummary,
  type AdminPublisherSummary,
} from '@/features/publishers/api/get-admin-publisher-summary';

/**
 * Server-state hook for GET /admin/publishers/:userId/summary.
 */
export function useAdminPublisherSummary(
  userId: number,
): UseQueryResult<AdminPublisherSummary, Error> {
  return useQuery({
    queryKey: queryKeys.admin.publishers.summary(userId),
    queryFn: () => getAdminPublisherSummary(userId),
  });
}
