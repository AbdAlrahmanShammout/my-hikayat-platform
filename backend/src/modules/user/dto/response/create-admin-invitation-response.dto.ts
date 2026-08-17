import { ApiProperty } from '@nestjs/swagger';

import { CreateAdminInvitationServiceResult } from '@/modules/user/defs/admin-invitation-service.defs';
import { AdminInvitationResponse } from '@/modules/user/dto/response/model/admin-invitation.response';

export class CreateAdminInvitationResponseDto {
  @ApiProperty({ type: () => AdminInvitationResponse })
  invitation: AdminInvitationResponse;

  @ApiProperty({
    description: 'One-time token; returned only at creation and never stored in plaintext',
    example: 'nY3k8Q',
  })
  token: string;

  constructor(result: CreateAdminInvitationServiceResult) {
    this.invitation = new AdminInvitationResponse(result.invitation);
    this.token = result.token;
  }
}
