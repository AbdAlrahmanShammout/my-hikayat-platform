import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import type { ReadingCompletionCycle } from '@/features/reading-completion/api/list-reading-completions';
import { startReadingOver } from '@/features/reading-completion/api/start-reading-over';

/**
 * Confirmed restart of a completed book. Progress resets on the server; bookmarks do not.
 */
export function useStartReadingOver(
  bookId: number | null,
): UseMutationResult<ReadingCompletionCycle, Error, void> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (bookId === null) {
        return Promise.reject(new Error('Missing book'));
      }
      return startReadingOver(bookId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reader', 'reading-completions'] });
      await queryClient.invalidateQueries({ queryKey: ['reader', 'progress'] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.reader.progressList });
    },
  });
}
