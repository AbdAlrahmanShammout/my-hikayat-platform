import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
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

  constructor(entity: AdminInvitationEntity) {
    super(entity);
    this.email = entity.email;
    this.status = entity.status;
    this.expiresAt = entity.expiresAt;
    this.invitedByUserId = entity.invitedByUserId;
    this.acceptedAt = entity.acceptedAt;
  }
}
