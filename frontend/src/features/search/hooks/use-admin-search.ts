import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  searchAdmin,
  type AdminSearchQuery,
  type AdminSearchResponse,
} from '@/features/search/api/search-admin';

/**
 * Server-state hook for GET /admin/search.
 */
export function useAdminSearch(
  query: AdminSearchQuery,
  enabled: boolean,
): UseQueryResult<AdminSearchResponse, Error> {
  return useQuery({
    queryKey: queryKeys.admin.search.results(query),
    queryFn: () => searchAdmin(query),
    enabled,
  });
}
