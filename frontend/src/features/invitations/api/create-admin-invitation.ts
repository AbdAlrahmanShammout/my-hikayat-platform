import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Invites an admin by email. The raw token is returned only on this response.
 */
export async function createAdminInvitation(
  body: components['schemas']['CreateAdminInvitationRequestDto'],
): Promise<components['schemas']['CreateAdminInvitationResponseDto']> {
  return requestJson<components['schemas']['CreateAdminInvitationResponseDto']>({
    path: '/admin/invitations',
    method: 'POST',
    body,
  });
}
