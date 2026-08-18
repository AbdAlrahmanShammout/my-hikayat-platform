import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAuthorEarningsTrend,
  type ListAuthorEarningsTrendQuery,
} from '@/features/earnings/api/list-author-earnings-trend';
import type { components } from '@/generated/author';

/**
 * Server-state hook for GET /author/earnings/trend.
 */
export function useAuthorEarningsTrend(
  query: ListAuthorEarningsTrendQuery = {},
): UseQueryResult<components['schemas']['GetAuthorEarningsTrendResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.author.earnings.trend(query),
    queryFn: () => listAuthorEarningsTrend(query),
  });
}
