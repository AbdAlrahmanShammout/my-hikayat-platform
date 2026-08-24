import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type SearchCatalogField = 'title' | 'author' | 'publisher';

export type SearchCatalogBooksInput = {
  readonly limit?: number;
  readonly offset?: number;
  readonly title?: string;
  readonly author?: string;
  readonly publisher?: string;
};

export type GetSearchBooksResponse = components['schemas']['GetSearchBooksResponseDto'];

/**
 * Searches catalog-visible books by title, author, and/or publisher metadata.
 * Match semantics stay on the backend.
 */
export async function searchCatalogBooks(
  input: SearchCatalogBooksInput = {},
): Promise<GetSearchBooksResponse> {
  const params = new URLSearchParams();
  if (input.limit !== undefined) {
    params.set('limit', String(input.limit));
  }
  if (input.offset !== undefined) {
    params.set('offset', String(input.offset));
  }
  if (input.title !== undefined) {
    params.set('title', input.title);
  }
  if (input.author !== undefined) {
    params.set('author', input.author);
  }
  if (input.publisher !== undefined) {
    params.set('publisher', input.publisher);
  }
  const query: string = params.toString();
  return requestJson<GetSearchBooksResponse>({
    path: query === '' ? '/reader/search' : `/reader/search?${query}`,
    method: 'GET',
  });
}
