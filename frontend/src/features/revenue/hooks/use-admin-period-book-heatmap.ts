import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getAdminPeriodBookHeatmap } from '@/features/revenue/api/get-admin-period-book-heatmap';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/revenue-periods/:id/books/:bookId/heatmap.
 */
export function useAdminPeriodBookHeatmap(
  revenuePeriodId: number,
  bookId: number,
): UseQueryResult<components['schemas']['GetAdminPeriodBookHeatmapResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.revenuePeriods.heatmap(revenuePeriodId, bookId),
    queryFn: () => getAdminPeriodBookHeatmap({ revenuePeriodId, bookId }),
  });
}
