import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type CatalogSort = 'newest' | 'popularity';

export type ListCatalogBooksInput = {
  readonly limit?: number;
  readonly offset?: number;
  readonly categoryId?: number;
  readonly sort?: CatalogSort;
};

export type GetBooksResponse = components['schemas']['GetBooksResponseDto'];

/**
 * Lists catalog-visible books. Visibility and sort semantics stay on the backend.
 */
export async function listCatalogBooks(input: ListCatalogBooksInput = {}): Promise<GetBooksResponse> {
  const params = new URLSearchParams();
  if (input.limit !== undefined) {
    params.set('limit', String(input.limit));
  }
  if (input.offset !== undefined) {
    params.set('offset', String(input.offset));
  }
  if (input.categoryId !== undefined) {
    params.set('categoryId', String(input.categoryId));
  }
  if (input.sort !== undefined) {
    params.set('sort', input.sort);
  }
  const query: string = params.toString();
  return requestJson<GetBooksResponse>({
    path: query === '' ? '/reader/catalog' : `/reader/catalog?${query}`,
    method: 'GET',
  });
}
