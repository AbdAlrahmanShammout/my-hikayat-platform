import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getAdminUser } from '@/features/users/api/get-admin-user';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/users/:id.
 */
export function useAdminUser(
  userId: number,
): UseQueryResult<components['schemas']['UserResponse'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.users.detail(userId),
    queryFn: () => getAdminUser(userId),
  });
}
