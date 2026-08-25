import { requestJson } from '@/api/client';
import type { ReadingBookmark } from '@/features/reader/api/create-reading-bookmark';

/**
 * Deletes one bookmark for the authenticated reader and book.
 */
export async function deleteReadingBookmark(input: {
  readonly bookId: number;
  readonly bookmarkId: number;
}): Promise<ReadingBookmark> {
  return requestJson<ReadingBookmark>({
    path: `/reader/books/${input.bookId}/bookmarks/${input.bookmarkId}`,
    method: 'DELETE',
  });
}
