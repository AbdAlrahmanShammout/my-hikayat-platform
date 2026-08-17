import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listAdminInvitations,
  type ListAdminInvitationsQuery,
} from '@/features/invitations/api/list-admin-invitations';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/invitations.
 */
export function useAdminInvitationsList(
  query: ListAdminInvitationsQuery = {},
): UseQueryResult<components['schemas']['GetAdminInvitationsResponseDto'], Error> {
  return useQuery({
    queryKey: queryKeys.admin.invitations.list(query),
    queryFn: () => listAdminInvitations(query),
  });
}
