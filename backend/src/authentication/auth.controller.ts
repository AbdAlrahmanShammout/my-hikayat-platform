import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthSession } from '@/authentication/defs/auth-service.defs';
import { LoginRequestDto } from '@/authentication/dto/request/login-request.dto';
import { LogoutRequestDto } from '@/authentication/dto/request/logout-request.dto';
import { RefreshSessionRequestDto } from '@/authentication/dto/request/refresh-session-request.dto';
import { RegisterRequestDto } from '@/authentication/dto/request/register-request.dto';
import { AuthSessionResponseDto } from '@/authentication/dto/response/auth-session-response.dto';
import {
  CREDENTIAL_THROTTLE_LIMIT,
  CREDENTIAL_THROTTLE_TTL_MS,
  DEFAULT_THROTTLE_NAME,
} from '@/common/constants/http-surface.constant';
import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { CredentialRoute } from '@/common/decorators/route/credential-route.decorator';
import { PublicRoute } from '@/common/decorators/route/public-route.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AcceptAdminInvitationRequestDto } from '@/modules/user/dto/request/accept-admin-invitation-request.dto';
import { UserResponse } from '@/modules/user/dto/response/model/user.response';
import { UserEntity } from '@/modules/user/entity/user.entity';

import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicRoute()
  @CredentialRoute()
  @Throttle({
    [DEFAULT_THROTTLE_NAME]: { ttl: CREDENTIAL_THROTTLE_TTL_MS, limit: CREDENTIAL_THROTTLE_LIMIT },
  })
  @Post('register')
  @ApiOperation({ summary: 'Register a reader account' })
  @ApiBody({ type: RegisterRequestDto })
  @ApiResponse({ status: 201, type: AuthSessionResponseDto })
  async register(@Body() input: RegisterRequestDto): Promise<AuthSessionResponseDto> {
    const session: AuthSession = await this.authService.register({
      email: input.email,
      password: input.password,
      displayName: input.displayName,
    });
    return new AuthSessionResponseDto(session);
  }

  @PublicRoute()
  @CredentialRoute()
  @Throttle({
    [DEFAULT_THROTTLE_NAME]: { ttl: CREDENTIAL_THROTTLE_TTL_MS, limit: CREDENTIAL_THROTTLE_LIMIT },
  })
  @Post('accept-admin-invitation')
  @ApiOperation({ summary: 'Accept an admin invitation and start an admin session' })
  @ApiBody({ type: AcceptAdminInvitationRequestDto })
  @ApiResponse({ status: 201, type: AuthSessionResponseDto })
  async acceptAdminInvitation(
    @Body() input: AcceptAdminInvitationRequestDto,
  ): Promise<AuthSessionResponseDto> {
    const session: AuthSession = await this.authService.acceptAdminInvitation({
      token: input.token,
      password: input.password,
    });
    return new AuthSessionResponseDto(session);
  }

  @PublicRoute()
  @CredentialRoute()
  @UseGuards(LocalAuthGuard)
  @Throttle({
    [DEFAULT_THROTTLE_NAME]: { ttl: CREDENTIAL_THROTTLE_TTL_MS, limit: CREDENTIAL_THROTTLE_LIMIT },
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({ status: 200, type: AuthSessionResponseDto })
  async login(@LoggedInUser() currentUser: UserEntity): Promise<AuthSessionResponseDto> {
    const session: AuthSession = await this.authService.createSession(currentUser);
    return new AuthSessionResponseDto(session);
  }

  @PublicRoute()
  @CredentialRoute()
  @Throttle({
    [DEFAULT_THROTTLE_NAME]: { ttl: CREDENTIAL_THROTTLE_TTL_MS, limit: CREDENTIAL_THROTTLE_LIMIT },
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a refresh token for a new access session' })
  @ApiBody({ type: RefreshSessionRequestDto })
  @ApiResponse({ status: 200, type: AuthSessionResponseDto })
  async refresh(@Body() body: RefreshSessionRequestDto): Promise<AuthSessionResponseDto> {
    const session: AuthSession = await this.authService.refreshSession(body.refreshToken);
    return new AuthSessionResponseDto(session);
  }

  @PublicRoute()
  @CredentialRoute()
  @Throttle({
    [DEFAULT_THROTTLE_NAME]: { ttl: CREDENTIAL_THROTTLE_TTL_MS, limit: CREDENTIAL_THROTTLE_LIMIT },
  })
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke a refresh token and end the refreshable session' })
  @ApiBody({ type: LogoutRequestDto })
  @ApiResponse({ status: 204, description: 'Refresh token revoked when present' })
  async logout(@Body() body: LogoutRequestDto): Promise<void> {
    await this.authService.logout(body.refreshToken);
  }

  @Get('me')
  @ApiOperation({ summary: 'Return the authenticated principal' })
  @ApiResponse({ status: 200, type: UserResponse })
  getCurrentUser(@LoggedInUser() currentUser: UserEntity): UserResponse {
    return new UserResponse(currentUser);
  }
}
