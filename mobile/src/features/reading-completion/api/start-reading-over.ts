import { requestJson } from '@/api/client';
import type { ReadingCompletionCycle } from '@/features/reading-completion/api/list-reading-completions';

/**
 * Starts a new reading cycle for a completed book. Bookmarks stay where they are.
 */
export async function startReadingOver(bookId: number): Promise<ReadingCompletionCycle> {
  return requestJson<ReadingCompletionCycle>({
    path: `/reader/reading-completions/books/${bookId}/start-over`,
    method: 'POST',
  });
}
