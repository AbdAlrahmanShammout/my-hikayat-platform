import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/admin';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAdminBooksQuery = NonNullable<
  paths['/admin/books']['get']['parameters']['query']
>;

/**
 * Lists books for the admin audience. `total` is the catalog count.
 */
export async function listAdminBooks(
  query: ListAdminBooksQuery = {},
): Promise<components['schemas']['GetBooksResponseDto']> {
  return requestJson<components['schemas']['GetBooksResponseDto']>({
    path: `/admin/books${toSearchParams(query)}`,
    method: 'GET',
  });
}
