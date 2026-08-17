import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAdminUsers,
  type ListAdminUsersQuery,
} from '@/features/users/api/list-admin-users';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/users.
 */
export function useAdminUsersList(
  query: ListAdminUsersQuery = {},
): UseQueryResult<components['schemas']['GetUsersResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.users.list(query),
    queryFn: () => listAdminUsers(query),
  });
}
