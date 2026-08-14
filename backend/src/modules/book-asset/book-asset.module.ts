import { Module } from '@nestjs/common';

import { BookModule } from '@/modules/book/book.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';
import { EncryptionProviderModule } from '@/providers/encryption/encryption-provider.module';
import { StorageProviderModule } from '@/providers/storage/storage-provider.module';

import { BookAssetCatalogMediaService } from './book-asset-catalog-media.service';
import { BookAssetSourceService } from './book-asset-source.service';
import { BookAssetService } from './book-asset.service';
import { BookAssetPrismaRepository } from './repository/book-asset-prisma.repository';
import { BookAssetRepository } from './repository/book-asset.repository';

@Module({
  imports: [DatabaseProviderModule, BookModule, StorageProviderModule, EncryptionProviderModule],
  providers: [
    BookAssetService,
    BookAssetSourceService,
    BookAssetCatalogMediaService,
    { provide: BookAssetRepository, useClass: BookAssetPrismaRepository },
  ],
  exports: [BookAssetService, BookAssetSourceService, BookAssetCatalogMediaService],
})
export class BookAssetModule {}
