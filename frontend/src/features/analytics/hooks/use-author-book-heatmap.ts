import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getAuthorBookHeatmap } from '@/features/analytics/api/get-author-book-heatmap';
import type { components } from '@/generated/author';

/**
 * Server-state hook for GET /author/analytics/books/:bookId/heatmap.
 */
export function useAuthorBookHeatmap(
  bookId: number,
  revenuePeriodId: number,
): UseQueryResult<components['schemas']['GetAuthorBookHeatmapResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.author.analytics.heatmap(bookId, revenuePeriodId),
    queryFn: () => getAuthorBookHeatmap({ bookId, revenuePeriodId }),
  });
}
