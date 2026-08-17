import { queryKeys } from '@/api/query-keys';
import type { QueryClient } from '@tanstack/react-query';

/**
 * Refetches every admin users query after a mutation.
 */
export async function invalidateAdminUsersQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
}
