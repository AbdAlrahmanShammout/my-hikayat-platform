import type { ReadingProgress } from '@/features/reader/api/get-reading-progress';
import { useReadingProgressList } from '@/features/reader/hooks/use-reading-progress-list';

const CONTINUE_READING_LIMIT = 5;

/**
 * Home shelf: the five most recently opened books.
 */
export function useContinueReading(): {
  readonly items: readonly ReadingProgress[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => void;
} {
  const progress = useReadingProgressList();
  return {
    items: progress.items.slice(0, CONTINUE_READING_LIMIT),
    isLoading: progress.isLoading,
    isError: progress.isError,
    refetch: progress.refetch,
  };
}
