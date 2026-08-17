import { queryKeys } from '@/api/query-keys';
import type { QueryClient } from '@tanstack/react-query';

/**
 * Refetches every admin revenue-period query after a mutation.
 */
export async function invalidateAdminRevenuePeriodsQueries(
  queryClient: QueryClient,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.admin.revenuePeriods.all });
}
