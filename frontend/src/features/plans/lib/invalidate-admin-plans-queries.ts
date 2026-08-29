import { queryKeys } from '@/api/query-keys';
import type { QueryClient } from '@tanstack/react-query';

/**
 * Refetches every admin plans query after a mutation.
 */
export async function invalidateAdminPlansQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.admin.plans.all });
}
