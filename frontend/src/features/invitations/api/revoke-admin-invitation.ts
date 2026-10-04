import { requestJson } from '@/api/request-json';
import type { AdminInvitationRecord } from '@/features/invitations/api/admin-invitation-record';

/**
 * Revokes a pending invitation, including one that has already expired.
 */
export async function revokeAdminInvitation(
  invitationId: number,
  reason: string | undefined,
): Promise<AdminInvitationRecord> {
  return requestJson<AdminInvitationRecord>({
    path: `/admin/invitations/${invitationId}/revoke`,
    method: 'POST',
    body: reason === undefined ? {} : { reason },
  });
}
