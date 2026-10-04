import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAdminUserReadingProgress,
  type AdminReadingProgressPage,
  type ListAdminUserReadingProgressQuery,
} from '@/features/users/api/list-admin-user-reading-progress';

/**
 * Server-state hook for GET /admin/users/:userId/reading-progress.
 */
export function useAdminUserReadingProgress(
  userId: number,
  query: ListAdminUserReadingProgressQuery,
  enabled: boolean,
): UseQueryResult<AdminReadingProgressPage, Error> {
  return useQuery({
    queryKey: queryKeys.admin.users.readingProgress(userId, query),
    queryFn: () => listAdminUserReadingProgress(userId, query),
    enabled,
  });
}
