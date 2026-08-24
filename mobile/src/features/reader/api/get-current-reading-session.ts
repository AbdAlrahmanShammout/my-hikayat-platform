import { requestJson } from '@/api/client';
import type { ReadingSession } from '@/features/reader/api/start-reading-session';

/**
 * Loads the open reading session for a book, if one exists.
 */
export async function getCurrentReadingSession(bookId: number): Promise<ReadingSession> {
  return requestJson<ReadingSession>({
    path: `/reader/books/${bookId}/sessions/current`,
    method: 'GET',
  });
}
