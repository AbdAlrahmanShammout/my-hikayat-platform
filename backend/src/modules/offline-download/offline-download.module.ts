import { Module } from '@nestjs/common';

import { BookModule } from '@/modules/book/book.module';
import { EntitlementModule } from '@/modules/entitlement/entitlement.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { OfflineDownloadService } from './offline-download.service';
import { OfflineDownloadPrismaRepository } from './repository/offline-download-prisma.repository';
import { OfflineDownloadRepository } from './repository/offline-download.repository';

@Module({
  imports: [DatabaseProviderModule, BookModule, EntitlementModule],
  providers: [
    OfflineDownloadService,
    { provide: OfflineDownloadRepository, useClass: OfflineDownloadPrismaRepository },
  ],
  exports: [OfflineDownloadService],
})
export class OfflineDownloadModule {}
