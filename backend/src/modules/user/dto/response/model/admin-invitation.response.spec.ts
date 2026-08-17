import { AdminInvitationStatus } from '@/modules/user/enum/admin-invitation-status.enum';
import { AdminInvitationEntity } from '@/modules/user/entity/admin-invitation.entity';

import { AdminInvitationResponse } from './admin-invitation.response';

describe('AdminInvitationResponse', () => {
  it('omits the token hash from the wire representation', () => {
    const entity = new AdminInvitationEntity({
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
    const actualResponse = new AdminInvitationResponse(entity);
    expect(actualResponse.email).toBe('new-admin@example.com');
    expect(actualResponse).not.toHaveProperty('tokenHash');
  });
});
