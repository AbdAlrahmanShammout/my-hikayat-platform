import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import type { ReadingProgress } from '@/features/reader/api/get-reading-progress';
import { getReadingSync } from '@/features/reader/api/get-reading-sync';
import { sortProgressByLastSession } from '@/features/reader/lib/continue-reading';

export type ReadingProgressList = {
  readonly items: readonly ReadingProgress[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => void;
};

/**
 * All saved reading positions for this reader, newest session first.
 * Opening a book creates a progress row, so this is the opened-books list.
 */
export function useReadingProgressList(): ReadingProgressList {
  const query = useQuery({
    queryKey: queryKeys.reader.progressList,
    queryFn: async (): Promise<readonly ReadingProgress[]> => {
      const snapshot = await getReadingSync();
      return sortProgressByLastSession(snapshot.progress);
    },
    staleTime: 0,
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
