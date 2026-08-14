import { Module } from '@nestjs/common';

import { AuthModule } from '@/authentication/auth.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserModule } from '@/modules/user/user.module';
import { UserReaderController } from '@/modules/user/user.reader.controller';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [UserReaderController],
  providers: [JwtAuthGuard, LocalAuthGuard, RolesGuard],
})
export class ReaderApiModule {}
