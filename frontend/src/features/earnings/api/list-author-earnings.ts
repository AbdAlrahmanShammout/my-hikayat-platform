import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/author';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAuthorEarningsQuery = NonNullable<
  paths['/author/earnings']['get']['parameters']['query']
>;

/**
 * Lists per-book author shares for one revenue period. Totals come from the API.
 */
export async function listAuthorEarnings(
  query: ListAuthorEarningsQuery,
): Promise<components['schemas']['GetAuthorEarningsResponseDto']> {
  return requestJson<components['schemas']['GetAuthorEarningsResponseDto']>({
    path: `/author/earnings${toSearchParams(query)}`,
    method: 'GET',
  });
}
