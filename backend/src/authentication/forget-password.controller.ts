import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { ForgotPasswordRequestDto } from '@/authentication/dto/request/forgot-password-request.dto';
import { ResetPasswordRequestDto } from '@/authentication/dto/request/reset-password-request.dto';
import { ForgotPasswordResponseDto } from '@/authentication/dto/response/forgot-password-response.dto';
import { ResetPasswordResponseDto } from '@/authentication/dto/response/reset-password-response.dto';
import { ForgetPasswordService } from '@/authentication/forget-password.service';
import {
  CREDENTIAL_THROTTLE_LIMIT,
  CREDENTIAL_THROTTLE_TTL_MS,
  DEFAULT_THROTTLE_NAME,
} from '@/common/constants/http-surface.constant';
import { CredentialRoute } from '@/common/decorators/route/credential-route.decorator';
import { PublicRoute } from '@/common/decorators/route/public-route.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ForgetPasswordController {
  constructor(private readonly forgetPasswordService: ForgetPasswordService) {}

  @PublicRoute()
  @CredentialRoute()
  @Throttle({
    [DEFAULT_THROTTLE_NAME]: { ttl: CREDENTIAL_THROTTLE_TTL_MS, limit: CREDENTIAL_THROTTLE_LIMIT },
  })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request a password reset email (enumeration-safe)',
  })
  @ApiBody({ type: ForgotPasswordRequestDto })
  @ApiResponse({ status: 200, type: ForgotPasswordResponseDto })
  async forgotPassword(
    @Body() input: ForgotPasswordRequestDto,
  ): Promise<ForgotPasswordResponseDto> {
    const message: string = await this.forgetPasswordService.requestPasswordReset({
      email: input.email,
    });
    return new ForgotPasswordResponseDto(message);
  }

  @PublicRoute()
  @CredentialRoute()
  @Throttle({
    [DEFAULT_THROTTLE_NAME]: { ttl: CREDENTIAL_THROTTLE_TTL_MS, limit: CREDENTIAL_THROTTLE_LIMIT },
  })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a new password using a recovery token' })
  @ApiBody({ type: ResetPasswordRequestDto })
  @ApiResponse({ status: 200, type: ResetPasswordResponseDto })
  async resetPassword(@Body() input: ResetPasswordRequestDto): Promise<ResetPasswordResponseDto> {
    const message: string = await this.forgetPasswordService.confirmPasswordReset({
      token: input.token,
      password: input.password,
    });
    return new ResetPasswordResponseDto(message);
  }
}
