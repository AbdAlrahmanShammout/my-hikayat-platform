import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type ReadingSyncSnapshot = components['schemas']['GetReadingSyncResponseDto'];

/**
 * Pulls layout-discriminated reading progress and bookmarks for this reader.
 */
export async function getReadingSync(input?: {
  readonly updatedSince?: string;
}): Promise<ReadingSyncSnapshot> {
  const params = new URLSearchParams();
  if (input?.updatedSince !== undefined && input.updatedSince.trim().length > 0) {
    params.set('updatedSince', input.updatedSince);
  }
  const query: string = params.toString();
  return requestJson<ReadingSyncSnapshot>({
    path: query.length === 0 ? '/reader/sync' : `/reader/sync?${query}`,
    method: 'GET',
  });
}
