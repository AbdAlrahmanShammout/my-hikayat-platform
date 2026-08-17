import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/admin';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAdminCategoriesQuery = NonNullable<
  paths['/admin/categories']['get']['parameters']['query']
>;

/**
 * Lists categories for the admin audience.
 */
export async function listAdminCategories(
  query: ListAdminCategoriesQuery = {},
): Promise<components['schemas']['GetCategoriesResponseDto']> {
  return requestJson<components['schemas']['GetCategoriesResponseDto']>({
    path: `/admin/categories${toSearchParams(query)}`,
    method: 'GET',
  });
}
