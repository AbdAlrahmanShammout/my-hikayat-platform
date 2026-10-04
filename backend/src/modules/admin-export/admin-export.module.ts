import { Module } from '@nestjs/common';

import { AdminExportQueryService } from '@/modules/admin-export/admin-export-query.service';
import { AdminExportService } from '@/modules/admin-export/admin-export.service';
import { AuditModule } from '@/modules/audit/audit.module';
import { BookModule } from '@/modules/book/book.module';
import { SubscriptionModule } from '@/modules/subscription/subscription.module';
import { PublisherDirectoryModule } from '@/modules/user/publisher-directory.module';
import { UserModule } from '@/modules/user/user.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';
import { StorageProviderModule } from '@/providers/storage/storage-provider.module';

@Module({
  imports: [
    DatabaseProviderModule,
    StorageProviderModule,
    AuditModule,
    BookModule,
    UserModule,
    PublisherDirectoryModule,
    SubscriptionModule,
  ],
  providers: [AdminExportQueryService, AdminExportService],
  exports: [AdminExportService],
})
export class AdminExportModule {}
