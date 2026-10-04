import { BaseEntity } from '@/common/base/base.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { AdminInvitationStatus } from '@/modules/user/enum/admin-invitation-status.enum';
import { AdminInvitationZodType } from '@/modules/user/zod/admin-invitation.zod';

export class AdminInvitationEntity extends BaseEntity {
  email!: string;
  tokenHash!: string;
  status!: AdminInvitationStatus;
  expiresAt!: Date;
  invitedByUserId!: number;
  acceptedAt!: Date | null;
  lastSentAt!: Date | null;
  resendCount!: number;
  revokedAt!: Date | null;
  revokedByUserId!: number | null;
  revokeReason!: string | null;
  invitedBy?: UserEntity;

  constructor(data: AdminInvitationZodType) {
    super();
    Object.assign(this, data);
  }
}
