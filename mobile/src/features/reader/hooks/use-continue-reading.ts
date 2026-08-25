import { useQuery } from '@tanstack/react-query';

import { getReadingSync } from '@/features/reader/api/get-reading-sync';
import { sortProgressByLastSession } from '@/features/reader/lib/continue-reading';
import type { ReadingProgress } from '@/features/reader/api/get-reading-progress';

const CONTINUE_READING_LIMIT = 5;

/**
 * Loads Continue Reading rows from the reader sync pull.
 */
export function useContinueReading(): {
  readonly items: readonly ReadingProgress[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => void;
} {
  const query = useQuery({
    queryKey: ['reader', 'sync', 'continue-reading'],
    queryFn: async (): Promise<readonly ReadingProgress[]> => {
      const snapshot = await getReadingSync();
      return sortProgressByLastSession(snapshot.progress).slice(0, CONTINUE_READING_LIMIT);
    },
  });
  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
  };
}
