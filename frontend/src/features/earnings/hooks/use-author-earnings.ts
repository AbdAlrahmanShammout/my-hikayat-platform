import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAuthorEarnings,
  type ListAuthorEarningsQuery,
} from '@/features/earnings/api/list-author-earnings';
import type { components } from '@/generated/author';

/**
 * Server-state hook for GET /author/earnings.
 */
export function useAuthorEarnings(
  query: ListAuthorEarningsQuery | null,
): UseQueryResult<components['schemas']['GetAuthorEarningsResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.author.earnings.list(query ?? { revenuePeriodId: 0 }),
    queryFn: () => {
      if (query === null) {
        throw new Error('revenuePeriodId is required for GET /author/earnings');
      }
      return listAuthorEarnings(query);
    },
    enabled: query !== null,
  });
}
