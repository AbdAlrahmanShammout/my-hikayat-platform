import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AdminInvitationService } from '@/modules/user/admin-invitation.service';
import { AdminInvitationPage } from '@/modules/user/defs/admin-invitation-repository.defs';
import { CreateAdminInvitationServiceResult } from '@/modules/user/defs/admin-invitation-service.defs';
import { CreateAdminInvitationRequestDto } from '@/modules/user/dto/request/create-admin-invitation-request.dto';
import { ListAdminInvitationsRequestDto } from '@/modules/user/dto/request/list-admin-invitations-request.dto';
import { CreateAdminInvitationResponseDto } from '@/modules/user/dto/response/create-admin-invitation-response.dto';
import { GetAdminInvitationsResponseDto } from '@/modules/user/dto/response/get-admin-invitations-response.dto';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Admin - Invitations')
@Controller('admin/invitations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminInvitationAdminController {
  constructor(private readonly adminInvitationService: AdminInvitationService) {}

  @Get()
  @ApiOperation({ summary: 'List pending unexpired admin invitations' })
  @ApiResponse({ status: 200, type: GetAdminInvitationsResponseDto })
  async listInvitations(
    @Query() query: ListAdminInvitationsRequestDto,
  ): Promise<GetAdminInvitationsResponseDto> {
    const page: AdminInvitationPage = await this.adminInvitationService.listPendingInvitations({
      limit: query.limit,
      offset: query.offset,
    });
    return new GetAdminInvitationsResponseDto(page);
  }

  @Post()
  @ApiOperation({ summary: 'Invite an admin by email; the raw token is returned only once' })
  @ApiBody({ type: CreateAdminInvitationRequestDto })
  @ApiResponse({ status: 201, type: CreateAdminInvitationResponseDto })
  async createInvitation(
    @Body() body: CreateAdminInvitationRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<CreateAdminInvitationResponseDto> {
    const result: CreateAdminInvitationServiceResult =
      await this.adminInvitationService.createInvitation({
        email: body.email,
        invitedByUserId: currentUser.id,
      });
    return new CreateAdminInvitationResponseDto(result);
  }
}
