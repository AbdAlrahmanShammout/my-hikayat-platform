import { requestJson } from '@/api/request-json';
import type { AuthSession } from '@/features/auth/api/auth-session';
import type { components } from '@/generated/admin';

export type AcceptAdminInvitationRequest = components['schemas']['AcceptAdminInvitationRequestDto'];

/**
 * Accepts an admin invitation with a one-time token. Returns an admin session.
 */
export async function acceptAdminInvitation(
  input: AcceptAdminInvitationRequest,
): Promise<AuthSession> {
  return requestJson<AuthSession>({
    path: '/auth/accept-admin-invitation',
    method: 'POST',
    body: input,
  });
}
