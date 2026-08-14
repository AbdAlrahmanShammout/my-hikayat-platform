import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthSession } from '@/authentication/defs/auth-service.defs';
import { LoginRequestDto } from '@/authentication/dto/request/login-request.dto';
import { RegisterRequestDto } from '@/authentication/dto/request/register-request.dto';
import { AuthSessionResponseDto } from '@/authentication/dto/response/auth-session-response.dto';
import {
  CREDENTIAL_THROTTLE_LIMIT,
  CREDENTIAL_THROTTLE_TTL_MS,
} from '@/common/constants/http-surface.constant';
import { CredentialThrottlerGuard } from '@/common/guards/credential-throttler.guard';

import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(CredentialThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Throttle({ default: { ttl: CREDENTIAL_THROTTLE_TTL_MS, limit: CREDENTIAL_THROTTLE_LIMIT } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({ status: 200, type: AuthSessionResponseDto })
  async login(@Body() input: LoginRequestDto): Promise<AuthSessionResponseDto> {
    const session: AuthSession = await this.authService.login({
      email: input.email,
      password: input.password,
    });
    return new AuthSessionResponseDto(session);
  }
}
