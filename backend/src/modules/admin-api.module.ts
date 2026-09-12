import { Module } from '@nestjs/common';

import { AuthModule } from '@/authentication/auth.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AuditAdminController } from '@/modules/audit/audit.admin.controller';
import { AuditModule } from '@/modules/audit/audit.module';
import { BookAdminController } from '@/modules/book/book.admin.controller';
import { BookModule } from '@/modules/book/book.module';
import { BookAssetModule } from '@/modules/book-asset/book-asset.module';
import { CategoryAdminController } from '@/modules/category/category.admin.controller';
import { CategoryModule } from '@/modules/category/category.module';
import { CollectionAdminController } from '@/modules/collection/collection.admin.controller';
import { CollectionModule } from '@/modules/collection/collection.module';
import { DashboardAdminController } from '@/modules/monetization/dashboard.admin.controller';
import { MonetizationAdminController } from '@/modules/monetization/monetization.admin.controller';
import { MonetizationModule } from '@/modules/monetization/monetization.module';
import { PlatformSettingAdminController } from '@/modules/platform-setting/platform-setting.admin.controller';
import { PlatformSettingModule } from '@/modules/platform-setting/platform-setting.module';
import { PlanAdminController } from '@/modules/subscription/plan.admin.controller';
import { SubscriptionAdminController } from '@/modules/subscription/subscription.admin.controller';
import { SubscriptionModule } from '@/modules/subscription/subscription.module';
import { AdminInvitationAdminController } from '@/modules/user/admin-invitation.admin.controller';
import { UserAdminController } from '@/modules/user/user.admin.controller';
import { UserAdminDetailModule } from '@/modules/user/user-admin-detail.module';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    BookModule,
    BookAssetModule,
    CategoryModule,
    CollectionModule,
    MonetizationModule,
    PlatformSettingModule,
    SubscriptionModule,
    UserModule,
    UserAdminDetailModule,
  ],
  controllers: [
    AuditAdminController,
    BookAdminController,
    CategoryAdminController,
    CollectionAdminController,
    DashboardAdminController,
    MonetizationAdminController,
    PlatformSettingAdminController,
    PlanAdminController,
    SubscriptionAdminController,
    UserAdminController,
    AdminInvitationAdminController,
  ],
  providers: [JwtAuthGuard, LocalAuthGuard, RolesGuard],
})
export class AdminApiModule {}
