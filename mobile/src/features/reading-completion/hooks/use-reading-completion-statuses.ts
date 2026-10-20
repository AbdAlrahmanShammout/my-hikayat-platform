import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listReadingCompletions,
  type ReadingCompletionStatus,
} from '@/features/reading-completion/api/list-reading-completions';

/**
 * Loads stored reading statuses for the books currently on screen.
 */
export function useReadingCompletionStatuses(bookIds: readonly number[]) {
  const uniqueBookIds: number[] = [...new Set(bookIds)].sort((left, right) => left - right);
  const query = useQuery({
    queryKey: queryKeys.readingCompletions.books(uniqueBookIds),
    queryFn: () => listReadingCompletions(uniqueBookIds),
    enabled: uniqueBookIds.length > 0,
  });
  const byBookId = new Map<number, ReadingCompletionStatus>();
  for (const cycle of query.data?.cycles ?? []) {
    byBookId.set(cycle.bookId, cycle.status);
  }
  return { byBookId, isLoading: query.isLoading };
}
