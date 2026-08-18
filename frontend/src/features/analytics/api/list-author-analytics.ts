import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/author';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAuthorAnalyticsQuery = NonNullable<
  paths['/author/analytics']['get']['parameters']['query']
>;

/**
 * Lists owner book engagement for one revenue period. Totals come from the API.
 */
export async function listAuthorAnalytics(
  query: ListAuthorAnalyticsQuery,
): Promise<components['schemas']['GetAuthorAnalyticsResponseDto']> {
  return requestJson<components['schemas']['GetAuthorAnalyticsResponseDto']>({
    path: `/author/analytics${toSearchParams(query)}`,
    method: 'GET',
  });
}
