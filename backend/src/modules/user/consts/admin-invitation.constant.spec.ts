import {
  ADMIN_INVITATION_ACCEPT_PATH,
  ADMIN_INVITATION_APPLICATION_NAME,
  ADMIN_INVITATION_TOKEN,
  ADMIN_INVITATION_WINDOW,
} from './admin-invitation.constant';

describe('ADMIN_INVITATION_WINDOW', () => {
  it('expires invitations after seven days', () => {
    expect(ADMIN_INVITATION_WINDOW.days).toBe(7);
    expect(ADMIN_INVITATION_TOKEN.byteLength).toBe(32);
  });
});

describe('ADMIN_INVITATION_ACCEPT_PATH', () => {
  it('identifies My Hikayat and the public accept path', () => {
    expect(ADMIN_INVITATION_APPLICATION_NAME).toBe('My Hikayat');
    expect(ADMIN_INVITATION_ACCEPT_PATH).toBe('/accept-admin-invitation');
  });
});
