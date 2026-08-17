import { queryKeys } from '@/api/query-keys';
import type { QueryClient } from '@tanstack/react-query';

/**
 * Refetches every admin invitation query after a mutation.
 */
export async function invalidateAdminInvitationsQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.admin.invitations.all });
}
