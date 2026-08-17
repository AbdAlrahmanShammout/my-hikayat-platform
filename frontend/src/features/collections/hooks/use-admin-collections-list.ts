import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAdminCollections,
  type ListAdminCollectionsQuery,
} from '@/features/collections/api/list-admin-collections';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/collections.
 */
export function useAdminCollectionsList(
  query: ListAdminCollectionsQuery = {},
): UseQueryResult<components['schemas']['GetCollectionsResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.collections.list(query),
    queryFn: () => listAdminCollections(query),
  });
}
