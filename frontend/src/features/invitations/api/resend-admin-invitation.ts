import { requestJson } from '@/api/request-json';
import type { AdminInvitationRecord } from '@/features/invitations/api/admin-invitation-record';

/**
 * Resends a pending unexpired invitation. The response does not include the raw token.
 */
export async function resendAdminInvitation(invitationId: number): Promise<AdminInvitationRecord> {
  return requestJson<AdminInvitationRecord>({
    path: `/admin/invitations/${invitationId}/resend`,
    method: 'POST',
  });
}
