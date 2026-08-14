import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from '@/authentication/auth.service';
import { AuthSession } from '@/authentication/defs/auth-service.defs';
import { AuthSessionResponseDto } from '@/authentication/dto/response/auth-session-response.dto';
import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserService } from '@/modules/user/user.service';

@ApiTags('Reader - User')
@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserReaderController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('publisher')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable publisher capability and become an author' })
  @ApiResponse({ status: 200, type: AuthSessionResponseDto })
  async enablePublisherCapability(
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<AuthSessionResponseDto> {
    const user: UserEntity = await this.userService.enablePublisherCapability({
      userId: currentUser.id,
    });
    const session: AuthSession = this.authService.createSession(user);
    return new AuthSessionResponseDto(session);
  }
}
