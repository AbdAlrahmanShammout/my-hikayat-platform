import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';
import type { ReadingBookmark } from '@/features/reader/api/create-reading-bookmark';

export type GetReadingBookmarksResponse =
  components['schemas']['GetReadingBookmarksResponseDto'];

/**
 * Lists bookmarks for the authenticated reader and book.
 */
export async function listReadingBookmarks(input: {
  readonly bookId: number;
  readonly limit?: number;
  readonly offset?: number;
}): Promise<GetReadingBookmarksResponse> {
  const params = new URLSearchParams();
  if (input.limit !== undefined) {
    params.set('limit', String(input.limit));
  }
  if (input.offset !== undefined) {
    params.set('offset', String(input.offset));
  }
  const query: string = params.toString();
  return requestJson<GetReadingBookmarksResponse>({
    path:
      query.length === 0
        ? `/reader/books/${input.bookId}/bookmarks`
        : `/reader/books/${input.bookId}/bookmarks?${query}`,
    method: 'GET',
  });
}

/**
 * Returns bookmark entities only (empty list when none).
 */
export async function listReadingBookmarkItems(bookId: number): Promise<readonly ReadingBookmark[]> {
  const response: GetReadingBookmarksResponse = await listReadingBookmarks({ bookId });
  return response.bookmarks;
}
