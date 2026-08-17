import { ADMIN_INVITATION_TOKEN, ADMIN_INVITATION_WINDOW } from './admin-invitation.constant';

describe('ADMIN_INVITATION_WINDOW', () => {
  it('expires invitations after seven days', () => {
    expect(ADMIN_INVITATION_WINDOW.days).toBe(7);
    expect(ADMIN_INVITATION_TOKEN.byteLength).toBe(32);
  });
});
