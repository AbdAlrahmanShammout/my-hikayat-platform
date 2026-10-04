import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getAdminUser, type AdminUserDetailResponse } from '@/features/users/api/get-admin-user';

/**
 * Server-state hook for GET /admin/users/:id.
 */
export function useAdminUser(userId: number): UseQueryResult<AdminUserDetailResponse, Error> {
  return useQuery({
    queryKey: queryKeys.admin.users.detail(userId),
    queryFn: () => getAdminUser(userId),
  });
}
