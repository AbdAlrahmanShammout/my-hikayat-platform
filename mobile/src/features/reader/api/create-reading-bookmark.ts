import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type ReadingBookmark = components['schemas']['ReadingBookmarkResponse'];
export type CreateReadingBookmarkRequest =
  components['schemas']['CreateReadingBookmarkRequestDto'];

/**
 * Creates a layout-discriminated bookmark at the current reading position.
 */
export async function createReadingBookmark(input: {
  readonly bookId: number;
  readonly body: CreateReadingBookmarkRequest;
}): Promise<ReadingBookmark> {
  return requestJson<ReadingBookmark>({
    path: `/reader/books/${input.bookId}/bookmarks`,
    method: 'POST',
    body: input.body,
  });
}
