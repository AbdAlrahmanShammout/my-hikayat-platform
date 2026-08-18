import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/author';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAuthorCategoriesQuery = NonNullable<
  paths['/author/categories']['get']['parameters']['query']
>;

/**
 * Lists the admin-owned taxonomy for the author audience. Read-only.
 */
export async function listAuthorCategories(
  query: ListAuthorCategoriesQuery = {},
): Promise<components['schemas']['GetCategoriesResponseDto']> {
  return requestJson<components['schemas']['GetCategoriesResponseDto']>({
    path: `/author/categories${toSearchParams(query)}`,
    method: 'GET',
  });
}
