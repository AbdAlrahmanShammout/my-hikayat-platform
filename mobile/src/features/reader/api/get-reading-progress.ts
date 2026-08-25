import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type ReadingProgress = components['schemas']['ReadingProgressResponse'];

/**
 * Loads the authenticated reader's Smart Resume position for a book.
 */
export async function getReadingProgress(bookId: number): Promise<ReadingProgress> {
  return requestJson<ReadingProgress>({
    path: `/reader/books/${bookId}/progress`,
    method: 'GET',
  });
}
