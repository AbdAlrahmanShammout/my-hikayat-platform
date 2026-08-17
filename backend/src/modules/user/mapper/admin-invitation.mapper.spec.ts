import { AdminInvitationStatus } from '@/modules/user/enum/admin-invitation-status.enum';

import { AdminInvitationMapper } from './admin-invitation.mapper';

describe('AdminInvitationMapper', () => {
  it('maps a persistence payload onto the invitation entity', () => {
    const createdAt = new Date('2026-08-17T00:00:00.000Z');
    const actualEntity = AdminInvitationMapper.toEntity({
      id: 4,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      email: 'new-admin@example.com',
      tokenHash: 'hashed-token',
      status: 'pending',
      expiresAt: new Date('2026-08-24T00:00:00.000Z'),
      invitedByUserId: 9,
      acceptedAt: null,
    });
    expect(actualEntity.status).toBe(AdminInvitationStatus.PENDING);
    expect(actualEntity.invitedByUserId).toBe(9);
  });
});
