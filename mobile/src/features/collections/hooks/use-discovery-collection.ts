import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  getDiscoveryCollection,
  type DiscoveryCollection,
} from '@/features/collections/api/get-discovery-collection';

/**
 * Loads one curated discovery collection for the detail screen.
 */
export function useDiscoveryCollection(collectionId: number | null) {
  return useQuery<DiscoveryCollection>({
    queryKey: queryKeys.collections.detail(collectionId ?? 0),
    queryFn: () => getDiscoveryCollection(collectionId as number),
    enabled: collectionId !== null && Number.isFinite(collectionId) && collectionId > 0,
  });
}
