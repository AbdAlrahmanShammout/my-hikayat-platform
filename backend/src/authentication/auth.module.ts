import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { CredentialThrottlerGuard } from '@/common/guards/credential-throttler.guard';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserModule } from '@/modules/user/user.module';
import { JwtProviderModule } from '@/providers/jwt/jwt-provider.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [UserModule, JwtProviderModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController],
  providers: [
    AuthService,
    CredentialThrottlerGuard,
    JwtAuthGuard,
    LocalAuthGuard,
    RolesGuard,
    JwtAuthStrategy,
    LocalStrategy,
  ],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
