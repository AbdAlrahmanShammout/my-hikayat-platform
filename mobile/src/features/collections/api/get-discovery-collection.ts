import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type DiscoveryCollection = components['schemas']['CollectionDiscoveryResponse'];

/**
 * Loads one curated discovery collection with catalog-visible books in editorial order.
 */
export async function getDiscoveryCollection(collectionId: number): Promise<DiscoveryCollection> {
  return requestJson<DiscoveryCollection>({
    path: `/reader/collections/${collectionId}`,
    method: 'GET',
  });
}
