import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { UserResponse } from '@/modules/user/dto/response/model/user.response';
import { AdminInvitationEntity } from '@/modules/user/entity/admin-invitation.entity';
import { AdminInvitationStatus } from '@/modules/user/enum/admin-invitation-status.enum';

export class AdminInvitationResponse extends BaseModelResponseDto {
  @ApiProperty({
    description: 'Invited email address',
    example: 'new-admin@example.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'Invitation lifecycle status',
    enum: AdminInvitationStatus,
    example: AdminInvitationStatus.PENDING,
  })
  status: AdminInvitationStatus;

  @ApiProperty({ description: 'When the invitation can no longer be accepted' })
  expiresAt: Date;

  @ApiProperty({ description: 'Admin who created the invitation', example: 9 })
  invitedByUserId: number;

  @ApiPropertyOptional({
    description: 'When the invitation was accepted',
    nullable: true,
  })
  acceptedAt: Date | null;

  @ApiPropertyOptional({ description: 'When the invitation email was last sent', nullable: true })
  lastSentAt: Date | null;

  @ApiProperty({ description: 'Number of successful resends after the original send', example: 0 })
  resendCount: number;

  @ApiPropertyOptional({ description: 'When the invitation was revoked', nullable: true })
  revokedAt: Date | null;

  @ApiPropertyOptional({ description: 'Admin who revoked the invitation', nullable: true })
  revokedByUserId: number | null;

  @ApiPropertyOptional({ description: 'Optional revoke reason', nullable: true })
  revokeReason: string | null;

  @ApiPropertyOptional({
    description: 'Inviting admin projection when loaded',
    type: () => UserResponse,
  })
  invitedBy?: UserResponse;

  constructor(entity: AdminInvitationEntity) {
    super(entity);
    this.email = entity.email;
    this.status = entity.status;
    this.expiresAt = entity.expiresAt;
    this.invitedByUserId = entity.invitedByUserId;
    this.acceptedAt = entity.acceptedAt;
    this.lastSentAt = entity.lastSentAt;
    this.resendCount = entity.resendCount;
    this.revokedAt = entity.revokedAt;
    this.revokedByUserId = entity.revokedByUserId;
    this.revokeReason = entity.revokeReason;
    this.invitedBy =
      entity.invitedBy === undefined ? undefined : new UserResponse(entity.invitedBy);
  }
}
