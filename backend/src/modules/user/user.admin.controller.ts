import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AdminUserDetail } from '@/modules/user/defs/user-admin-detail-service.defs';
import { ListUsersRequestDto } from '@/modules/user/dto/request/list-users-request.dto';
import { UpdateManagedUserRequestDto } from '@/modules/user/dto/request/update-managed-user-request.dto';
import { ListAdminUserReadingProgressRequestDto } from '@/modules/user/dto/request/list-admin-user-reading-progress-request.dto';
import { GetAdminUserBookEngagementResponseDto } from '@/modules/user/dto/response/get-admin-user-book-engagement-response.dto';
import { GetAdminUserDetailResponseDto } from '@/modules/user/dto/response/get-admin-user-detail-response.dto';
import { GetAdminUserReadingProgressResponseDto } from '@/modules/user/dto/response/get-admin-user-reading-progress-response.dto';
import { GetUsersResponseDto } from '@/modules/user/dto/response/get-users-response.dto';
import { UserResponse } from '@/modules/user/dto/response/model/user.response';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserAdminDetailService } from '@/modules/user/user-admin-detail.service';
import { UserBookEngagementService } from '@/modules/user/user-book-engagement.service';
import { UserService } from '@/modules/user/user.service';

@ApiTags('Admin - Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class UserAdminController {
  constructor(
    private readonly userService: UserService,
    private readonly userAdminDetailService: UserAdminDetailService,
    private readonly userBookEngagementService: UserBookEngagementService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List platform users' })
  @ApiResponse({ status: 200, type: GetUsersResponseDto })
  async listUsers(@Query() query: ListUsersRequestDto): Promise<GetUsersResponseDto> {
    const page = await this.userService.listManagedUsers({
      limit: query.limit,
      offset: query.offset,
      role: query.role,
      excludeRole: query.excludeRole,
      isPublisher: query.isPublisher,
      email: query.email,
      keyword: query.q,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
    return new GetUsersResponseDto(page);
  }

  @Get(':userId/reading-progress')
  @ApiOperation({ summary: 'Page a user reading progress past the detail preview' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, type: GetAdminUserReadingProgressResponseDto })
  async listReadingProgress(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: ListAdminUserReadingProgressRequestDto,
  ): Promise<GetAdminUserReadingProgressResponseDto> {
    const page = await this.userAdminDetailService.listReadingProgress({
      userId,
      limit: query.limit,
      offset: query.offset,
    });
    return new GetAdminUserReadingProgressResponseDto(page.items, page.total);
  }

  @Get(':userId/books/:bookId/engagement')
  @ApiOperation({ summary: 'Chapter or spread engagement for one user and one book' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiParam({ name: 'bookId', type: Number })
  @ApiResponse({ status: 200, type: GetAdminUserBookEngagementResponseDto })
  async getBookEngagement(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('bookId', ParseIntPipe) bookId: number,
  ): Promise<GetAdminUserBookEngagementResponseDto> {
    const engagement = await this.userBookEngagementService.getEngagement(userId, bookId);
    return new GetAdminUserBookEngagementResponseDto(engagement);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a platform user with subscription and reading progress' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: GetAdminUserDetailResponseDto })
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<GetAdminUserDetailResponseDto> {
    const detail: AdminUserDetail = await this.userAdminDetailService.getAdminUserDetail(id);
    return new GetAdminUserDetailResponseDto(detail);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Change a user role or publisher capability; cannot grant ADMIN' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateManagedUserRequestDto })
  @ApiResponse({ status: 200, type: UserResponse })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateManagedUserRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<UserResponse> {
    const entity: UserEntity = await this.userService.updateManagedUser({
      userId: id,
      actorUserId: currentUser.id,
      role: body.role,
      isPublisher: body.isPublisher,
    });
    return new UserResponse(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a platform user' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: UserResponse })
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<UserResponse> {
    const entity: UserEntity = await this.userService.deleteManagedUser({
      userId: id,
      actorUserId: currentUser.id,
    });
    return new UserResponse(entity);
  }
}
