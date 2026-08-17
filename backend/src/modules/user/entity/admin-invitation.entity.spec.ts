import { AdminInvitationEntity } from './admin-invitation.entity';
import { AdminInvitationStatus } from '@/modules/user/enum/admin-invitation-status.enum';

describe('AdminInvitationEntity', () => {
  it('holds invitation identity without exposing a raw token', () => {
    const actualEntity = new AdminInvitationEntity({
      id: 4,
      createdAt: new Date('2026-08-17T00:00:00.000Z'),
      updatedAt: new Date('2026-08-17T00:00:00.000Z'),
      email: 'new-admin@example.com',
      tokenHash: 'hashed-token',
      status: AdminInvitationStatus.PENDING,
      expiresAt: new Date('2026-08-24T00:00:00.000Z'),
      invitedByUserId: 9,
      acceptedAt: null,
    });
    expect(actualEntity.email).toBe('new-admin@example.com');
    expect(actualEntity.tokenHash).toBe('hashed-token');
    expect(actualEntity.status).toBe(AdminInvitationStatus.PENDING);
  });
});
