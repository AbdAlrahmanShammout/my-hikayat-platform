import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/author';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAuthorEarningsTrendQuery = NonNullable<
  paths['/author/earnings/trend']['get']['parameters']['query']
>;

/**
 * Lists revenue periods with author earnings cents.
 */
export async function listAuthorEarningsTrend(
  query: ListAuthorEarningsTrendQuery = {},
): Promise<components['schemas']['GetAuthorEarningsTrendResponseDto']> {
  return requestJson<components['schemas']['GetAuthorEarningsTrendResponseDto']>({
    path: `/author/earnings/trend${toSearchParams(query)}`,
    method: 'GET',
  });
}
