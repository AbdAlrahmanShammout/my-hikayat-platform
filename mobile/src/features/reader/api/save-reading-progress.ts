import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';
import type { ReadingProgress } from '@/features/reader/api/get-reading-progress';

export type SaveReadingProgressRequest = components['schemas']['SaveReadingProgressRequestDto'];

/**
 * Saves the authenticated reader's Smart Resume position for a book.
 */
export async function saveReadingProgress(input: {
  readonly bookId: number;
  readonly body: SaveReadingProgressRequest;
}): Promise<ReadingProgress> {
  return requestJson<ReadingProgress>({
    path: `/reader/books/${input.bookId}/progress`,
    method: 'PUT',
    body: input.body,
  });
}
