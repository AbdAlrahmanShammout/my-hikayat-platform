import { AdminInvitationEntity } from '@/modules/user/entity/admin-invitation.entity';
import { AdminInvitationStatus } from '@/modules/user/enum/admin-invitation-status.enum';
import { AdminInvitationType } from '@/modules/user/types/admin-invitation-details-schema.type';

export class AdminInvitationMapper {
  static toEntity(schema: AdminInvitationType): AdminInvitationEntity {
    return new AdminInvitationEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      email: schema.email,
      tokenHash: schema.tokenHash,
      status: schema.status as AdminInvitationStatus,
      expiresAt: schema.expiresAt,
      invitedByUserId: schema.invitedByUserId,
      acceptedAt: schema.acceptedAt,
    });
  }
}
