import { Module } from '@nestjs/common';

import { AuthModule } from '@/authentication/auth.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

@Module({
  imports: [AuthModule],
  providers: [JwtAuthGuard, LocalAuthGuard, RolesGuard],
})
export class ReaderApiModule {}
