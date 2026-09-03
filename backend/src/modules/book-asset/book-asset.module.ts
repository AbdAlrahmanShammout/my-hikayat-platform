import { Module } from '@nestjs/common';

import { AuditModule } from '@/modules/audit/audit.module';
import { BookModule } from '@/modules/book/book.module';
import { EntitlementModule } from '@/modules/entitlement/entitlement.module';
import { ReadingModule } from '@/modules/reading/reading.module';
import { SubscriptionModule } from '@/modules/subscription/subscription.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';
import { EncryptionProviderModule } from '@/providers/encryption/encryption-provider.module';
import { StorageProviderModule } from '@/providers/storage/storage-provider.module';

import { BookAssetCatalogMediaService } from './book-asset-catalog-media.service';
import { BookAssetContentKeyService } from './book-asset-content-key.service';
import { BookAssetDeliveryService } from './book-asset-delivery.service';
import { BookAssetSourceService } from './book-asset-source.service';
import { BookAssetService } from './book-asset.service';
import { BookCatalogCoverService } from './book-catalog-cover.service';
import { OfflineReadingLeaseService } from './offline-reading-lease.service';
import { BookAssetPrismaRepository } from './repository/book-asset-prisma.repository';
import { BookAssetRepository } from './repository/book-asset.repository';

@Module({
  imports: [
    DatabaseProviderModule,
    BookModule,
    EntitlementModule,
    ReadingModule,
    SubscriptionModule,
    AuditModule,
    StorageProviderModule,
    EncryptionProviderModule,
  ],
  providers: [
    BookAssetService,
    BookAssetSourceService,
    BookAssetCatalogMediaService,
    BookAssetDeliveryService,
    BookAssetContentKeyService,
    BookCatalogCoverService,
    OfflineReadingLeaseService,
    { provide: BookAssetRepository, useClass: BookAssetPrismaRepository },
  ],
  exports: [
    BookAssetService,
    BookAssetSourceService,
    BookAssetCatalogMediaService,
    BookAssetDeliveryService,
    BookAssetContentKeyService,
    BookCatalogCoverService,
    OfflineReadingLeaseService,
  ],
})
export class BookAssetModule {}
