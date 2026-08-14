import { Module } from '@nestjs/common';

import { CredentialThrottlerGuard } from '@/common/guards/credential-throttler.guard';
import { UserModule } from '@/modules/user/user.module';
import { JwtProviderModule } from '@/providers/jwt/jwt-provider.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, JwtProviderModule],
  controllers: [AuthController],
  providers: [AuthService, CredentialThrottlerGuard],
  exports: [AuthService],
})
export class AuthModule {}
