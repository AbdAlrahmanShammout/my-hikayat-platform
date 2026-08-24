import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type ListDiscoveryCollectionsInput = {
  readonly limit?: number;
  readonly offset?: number;
};

export type GetDiscoveryCollectionsResponse =
  components['schemas']['GetDiscoveryCollectionsResponseDto'];

/**
 * Lists curated discovery collections. Visibility and order stay on the backend.
 */
export async function listDiscoveryCollections(
  input: ListDiscoveryCollectionsInput = {},
): Promise<GetDiscoveryCollectionsResponse> {
  const params = new URLSearchParams();
  if (input.limit !== undefined) {
    params.set('limit', String(input.limit));
  }
  if (input.offset !== undefined) {
    params.set('offset', String(input.offset));
  }
  const query: string = params.toString();
  return requestJson<GetDiscoveryCollectionsResponse>({
    path: query === '' ? '/reader/collections' : `/reader/collections?${query}`,
    method: 'GET',
  });
}
