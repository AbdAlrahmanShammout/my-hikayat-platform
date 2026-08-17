import { ADMIN_INVITATION_APPLICATION_NAME } from '@/modules/user/consts/admin-invitation.constant';

import {
  buildAdminInvitationAcceptUrl,
  buildAdminInvitationMail,
} from './admin-invitation-mail.helper';

describe('admin-invitation-mail.helper', () => {
  it('builds an official invitation that names the app, includes the accept URL, and omits a password', () => {
    const actualMail = buildAdminInvitationMail({
      email: 'new-admin@example.com',
      token: 'raw-token',
      expiresAt: new Date('2026-08-24T00:00:00.000Z'),
      publicOrigin: 'http://localhost:5173/',
    });
    const expectedUrl: string = buildAdminInvitationAcceptUrl({
      publicOrigin: 'http://localhost:5173/',
      token: 'raw-token',
    });
    expect(actualMail.to).toBe('new-admin@example.com');
    expect(actualMail.subject).toContain(ADMIN_INVITATION_APPLICATION_NAME);
    expect(actualMail.text).toContain(ADMIN_INVITATION_APPLICATION_NAME);
    expect(actualMail.text).toContain(expectedUrl);
    expect(actualMail.text).toContain('2026-08-24T00:00:00.000Z');
    expect(actualMail.text.toLowerCase()).not.toContain('passwordHash');
    expect(expectedUrl).toBe('http://localhost:5173/accept-admin-invitation?token=raw-token');
  });
});
