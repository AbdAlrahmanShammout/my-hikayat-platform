import { Module } from '@nestjs/common';

import { AuthModule } from '@/authentication/auth.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookAdminController } from '@/modules/book/book.admin.controller';
import { BookModule } from '@/modules/book/book.module';

@Module({
  imports: [AuthModule, BookModule],
  controllers: [BookAdminController],
  providers: [JwtAuthGuard, LocalAuthGuard, RolesGuard],
})
export class AdminApiModule {}
