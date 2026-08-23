import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type ListCategoriesInput = {
  readonly limit?: number;
  readonly offset?: number;
};

export type GetCategoriesResponse = components['schemas']['GetCategoriesResponseDto'];

/**
 * Lists reader-facing categories for catalog filter chips.
 */
export async function listReaderCategories(
  input: ListCategoriesInput = {},
): Promise<GetCategoriesResponse> {
  const params = new URLSearchParams();
  if (input.limit !== undefined) {
    params.set('limit', String(input.limit));
  }
  if (input.offset !== undefined) {
    params.set('offset', String(input.offset));
  }
  const query: string = params.toString();
  return requestJson<GetCategoriesResponse>({
    path: query === '' ? '/reader/categories' : `/reader/categories?${query}`,
    method: 'GET',
  });
}
