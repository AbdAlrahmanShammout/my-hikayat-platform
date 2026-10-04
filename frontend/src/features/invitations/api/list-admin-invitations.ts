import { requestJson } from '@/api/request-json';
import {
  type AdminInvitationsPage,
  type ListAdminInvitationsQuery,
} from '@/features/invitations/api/admin-invitation-record';
import { toSearchParams } from '@/lib/to-search-params';

/**
 * Lists admin invitations. Omitting status returns pending invitations that have not expired.
 */
export async function listAdminInvitations(
  query: ListAdminInvitationsQuery = {},
): Promise<AdminInvitationsPage> {
  return requestJson<AdminInvitationsPage>({
    path: `/admin/invitations${toSearchParams(query)}`,
    method: 'GET',
  });
}
