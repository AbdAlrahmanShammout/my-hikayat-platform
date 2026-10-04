import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import type {
  AdminInvitationsPage,
  ListAdminInvitationsQuery,
} from '@/features/invitations/api/admin-invitation-record';
import { listAdminInvitations } from '@/features/invitations/api/list-admin-invitations';

/**
 * Server-state hook for GET /admin/invitations.
 */
export function useAdminInvitationsList(
  query: ListAdminInvitationsQuery = {},
): UseQueryResult<AdminInvitationsPage, Error> {
  return useQuery({
    queryKey: queryKeys.admin.invitations.list(query),
    queryFn: () => listAdminInvitations(query),
  });
}
