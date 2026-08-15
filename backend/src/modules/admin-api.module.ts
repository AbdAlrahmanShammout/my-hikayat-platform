import { Module } from '@nestjs/common';

import { AuthModule } from '@/authentication/auth.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AuditAdminController } from '@/modules/audit/audit.admin.controller';
import { AuditModule } from '@/modules/audit/audit.module';
import { BookAdminController } from '@/modules/book/book.admin.controller';
import { BookModule } from '@/modules/book/book.module';
import { CollectionAdminController } from '@/modules/collection/collection.admin.controller';
import { CollectionModule } from '@/modules/collection/collection.module';
import { MonetizationAdminController } from '@/modules/monetization/monetization.admin.controller';
import { MonetizationModule } from '@/modules/monetization/monetization.module';
import { UserAdminController } from '@/modules/user/user.admin.controller';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [AuthModule, AuditModule, BookModule, CollectionModule, MonetizationModule, UserModule],
  controllers: [
    AuditAdminController,
    BookAdminController,
    CollectionAdminController,
    MonetizationAdminController,
    UserAdminController,
  ],
  providers: [JwtAuthGuard, LocalAuthGuard, RolesGuard],
})
export class AdminApiModule {}
