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
import { UserPage } from '@/modules/user/defs/user-repository.defs';
import { ListUsersRequestDto } from '@/modules/user/dto/request/list-users-request.dto';
import { UpdateManagedUserRequestDto } from '@/modules/user/dto/request/update-managed-user-request.dto';
import { GetUsersResponseDto } from '@/modules/user/dto/response/get-users-response.dto';
import { UserResponse } from '@/modules/user/dto/response/model/user.response';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserService } from '@/modules/user/user.service';

@ApiTags('Admin - Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class UserAdminController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'List platform users' })
  @ApiResponse({ status: 200, type: GetUsersResponseDto })
  async listUsers(@Query() query: ListUsersRequestDto): Promise<GetUsersResponseDto> {
    const page: UserPage = await this.userService.listUsers({
      limit: query.limit,
      offset: query.offset,
      role: query.role,
      isPublisher: query.isPublisher,
      email: query.email,
    });
    return new GetUsersResponseDto(page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a platform user' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: UserResponse })
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<UserResponse> {
    const entity: UserEntity = await this.userService.getUserById(id);
    return new UserResponse(entity);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Change a user role or publisher capability' })
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
