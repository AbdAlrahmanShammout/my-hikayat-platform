import { queryKeys } from '@/api/query-keys';
import type { QueryClient } from '@tanstack/react-query';

/**
 * Refetches every admin subscriptions query after a mutation.
 */
export async function invalidateAdminSubscriptionsQueries(
  queryClient: QueryClient,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.admin.subscriptions.all });
}
