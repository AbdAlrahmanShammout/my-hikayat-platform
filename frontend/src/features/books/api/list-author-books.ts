import { requestJson } from '@/api/request-json';
import type { components, paths } from '@/generated/author';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAuthorBooksQuery = NonNullable<
  paths['/author/books']['get']['parameters']['query']
>;

/**
 * Lists books owned by the authenticated publisher. `total` is the owner-scoped count.
 */
export async function listAuthorBooks(
  query: ListAuthorBooksQuery = {},
): Promise<components['schemas']['GetBooksResponseDto']> {
  return requestJson<components['schemas']['GetBooksResponseDto']>({
    path: `/author/books${toSearchParams(query)}`,
    method: 'GET',
  });
}
