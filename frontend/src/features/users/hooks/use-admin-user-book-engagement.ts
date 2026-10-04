import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  getAdminUserBookEngagement,
  type AdminUserBookEngagement,
} from '@/features/users/api/get-admin-user-book-engagement';

/**
 * Server-state hook for GET /admin/users/:userId/books/:bookId/engagement.
 */
export function useAdminUserBookEngagement(
  userId: number,
  bookId: number,
  enabled: boolean,
): UseQueryResult<AdminUserBookEngagement, Error> {
  return useQuery({
    queryKey: queryKeys.admin.users.engagement(userId, bookId),
    queryFn: () => getAdminUserBookEngagement(userId, bookId),
    enabled,
  });
}
