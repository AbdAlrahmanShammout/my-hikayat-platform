import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listDiscoveryCollections,
  type GetDiscoveryCollectionsResponse,
  type ListDiscoveryCollectionsInput,
} from '@/features/collections/api/list-discovery-collections';

/**
 * Loads curated discovery collections for the collections list screen.
 */
export function useDiscoveryCollections(input: ListDiscoveryCollectionsInput = {}) {
  return useQuery<GetDiscoveryCollectionsResponse>({
    queryKey: queryKeys.collections.list(input),
    queryFn: () => listDiscoveryCollections(input),
  });
}
