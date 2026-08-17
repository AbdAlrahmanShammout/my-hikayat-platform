import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getAdminCollection } from '@/features/collections/api/get-admin-collection';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/collections/:id.
 */
export function useAdminCollection(
  collectionId: number,
): UseQueryResult<components['schemas']['CollectionResponse'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.collections.detail(collectionId),
    queryFn: () => getAdminCollection(collectionId),
  });
}
