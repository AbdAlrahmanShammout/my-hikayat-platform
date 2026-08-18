import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getAuthorDashboardSummary } from '@/features/dashboard/api/get-author-dashboard-summary';
import type { components } from '@/generated/author';

/**
 * Server-state hook for GET /author/dashboard/summary.
 */
export function useAuthorDashboardSummary(): UseQueryResult<
  components['schemas']['GetAuthorDashboardSummaryResponseDto'],
  Error
> {
  return useQuery({
    queryKey: queryKeys.author.dashboard.summary(),
    queryFn: () => getAuthorDashboardSummary(),
  });
}
