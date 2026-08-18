import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAuthorAnalytics,
  type ListAuthorAnalyticsQuery,
} from '@/features/analytics/api/list-author-analytics';
import type { components } from '@/generated/author';

/**
 * Server-state hook for GET /author/analytics.
 */
export function useAuthorAnalytics(
  query: ListAuthorAnalyticsQuery | null,
): UseQueryResult<components['schemas']['GetAuthorAnalyticsResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.author.analytics.list(query ?? { revenuePeriodId: 0 }),
    queryFn: () => {
      if (query === null) {
        throw new Error('revenuePeriodId is required for GET /author/analytics');
      }
      return listAuthorAnalytics(query);
    },
    enabled: query !== null,
  });
}
