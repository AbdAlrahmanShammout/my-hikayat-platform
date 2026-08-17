import { AdminInvitationStatus } from './admin-invitation-status.enum';

describe('AdminInvitationStatus', () => {
  it('uses pending and accepted invitation states', () => {
    expect(AdminInvitationStatus.PENDING).toBe('pending');
    expect(AdminInvitationStatus.ACCEPTED).toBe('accepted');
  });
});
