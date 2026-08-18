import { queryKeys } from '@/api/query-keys';
import type { QueryClient } from '@tanstack/react-query';

/**
 * Refetches every author books query after a mutation.
 */
export async function invalidateAuthorBooksQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.author.books.all });
}
