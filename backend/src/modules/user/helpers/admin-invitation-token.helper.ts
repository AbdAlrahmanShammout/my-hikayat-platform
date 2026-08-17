import { createHash, randomBytes } from 'node:crypto';

import { ADMIN_INVITATION_TOKEN } from '@/modules/user/consts/admin-invitation.constant';

export function createAdminInvitationToken(): string {
  return randomBytes(ADMIN_INVITATION_TOKEN.byteLength).toString('base64url');
}

export function hashAdminInvitationToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
