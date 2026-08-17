import { ApiProperty } from '@nestjs/swagger';

import { AdminInvitationPage } from '@/modules/user/defs/admin-invitation-repository.defs';
import { AdminInvitationResponse } from '@/modules/user/dto/response/model/admin-invitation.response';

export class GetAdminInvitationsResponseDto {
  @ApiProperty({ type: () => [AdminInvitationResponse] })
  invitations: AdminInvitationResponse[];

  @ApiProperty({
    description: 'Total pending unexpired invitations, across all pages',
    example: 2,
  })
  total: number;

  constructor(page: AdminInvitationPage) {
    this.invitations = page.entities.map((entity) => new AdminInvitationResponse(entity));
    this.total = page.total;
  }
}
