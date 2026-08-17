import { createHash } from 'node:crypto';

import { ADMIN_INVITATION_TOKEN } from '@/modules/user/consts/admin-invitation.constant';

import {
  createAdminInvitationToken,
  hashAdminInvitationToken,
} from './admin-invitation-token.helper';

describe('admin-invitation-token.helper', () => {
  it('creates a unique token and hashes it with sha256', () => {
    const actualToken: string = createAdminInvitationToken();
    const otherToken: string = createAdminInvitationToken();
    expect(actualToken).not.toBe(otherToken);
    expect(Buffer.from(actualToken, 'base64url').length).toBe(ADMIN_INVITATION_TOKEN.byteLength);
    expect(hashAdminInvitationToken(actualToken)).toBe(
      createHash('sha256').update(actualToken).digest('hex'),
    );
  });
});
