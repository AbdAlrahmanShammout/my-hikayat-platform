import { requestJson } from '@/api/client';

export type ReadingCompletionStatus = 'in_progress' | 'completed';

export type ReadingCompletionCycle = {
  readonly id: number;
  readonly bookId: number;
  readonly status: ReadingCompletionStatus;
};

type ListReadingCompletionsResponse = {
  readonly cycles: readonly ReadingCompletionCycle[];
};

/**
 * Latest stored reading status for the signed-in reader.
 */
export async function listReadingCompletions(
  bookIds: readonly number[],
): Promise<ListReadingCompletionsResponse> {
  const query: string = bookIds.join(',');
  return requestJson<ListReadingCompletionsResponse>({
    path: `/reader/reading-completions?bookIds=${encodeURIComponent(query)}`,
    method: 'GET',
  });
}
