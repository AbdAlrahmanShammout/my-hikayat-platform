import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthSession } from '@/authentication/defs/auth-service.defs';
import { LoginRequestDto } from '@/authentication/dto/request/login-request.dto';
import { RegisterRequestDto } from '@/authentication/dto/request/register-request.dto';
import { AuthSessionResponseDto } from '@/authentication/dto/response/auth-session-response.dto';
import {
  CREDENTIAL_THROTTLE_LIMIT,
  CREDENTIAL_THROTTLE_TTL_MS,
} from '@/common/constants/http-surface.constant';
import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { PublicRoute } from '@/common/decorators/route/public-route.decorator';
import { CredentialThrottlerGuard } from '@/common/guards/credential-throttler.guard';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
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
  @UseGuards(CredentialThrottlerGuard)
  @Throttle({ default: { ttl: CREDENTIAL_THROTTLE_TTL_MS, limit: CREDENTIAL_THROTTLE_LIMIT } })
  @Post('register')
  @ApiOperation({ summary: 'Register a reader account' })
  @ApiBody({ type: RegisterRequestDto })
  @ApiResponse({ status: 201, type: AuthSessionResponseDto })
  async register(@Body() input: RegisterRequestDto): Promise<AuthSessionResponseDto> {
    const session: AuthSession = await this.authService.register({
      email: input.email,
      password: input.password,
    });
    return new AuthSessionResponseDto(session);
  }

  @PublicRoute()
  @UseGuards(CredentialThrottlerGuard, LocalAuthGuard)
  @Throttle({ default: { ttl: CREDENTIAL_THROTTLE_TTL_MS, limit: CREDENTIAL_THROTTLE_LIMIT } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({ status: 200, type: AuthSessionResponseDto })
  login(@LoggedInUser() currentUser: UserEntity): AuthSessionResponseDto {
    const session: AuthSession = this.authService.createSession(currentUser);
    return new AuthSessionResponseDto(session);
  }

  @Get('me')
  @ApiOperation({ summary: 'Return the authenticated principal' })
  @ApiResponse({ status: 200, type: UserResponse })
  getCurrentUser(@LoggedInUser() currentUser: UserEntity): UserResponse {
    return new UserResponse(currentUser);
  }
}
