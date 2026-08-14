import { Module } from '@nestjs/common';

import { BookModule } from '@/modules/book/book.module';
import { BookAssetModule } from '@/modules/book-asset/book-asset.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';
import { EncryptionProviderModule } from '@/providers/encryption/encryption-provider.module';
import { StorageProviderModule } from '@/providers/storage/storage-provider.module';

import { BookProcessingService } from './book-processing.service';
import { BookChapterPrismaRepository } from './repository/book-chapter-prisma.repository';
import { BookChapterRepository } from './repository/book-chapter.repository';
import { BookSourceMetadataPrismaRepository } from './repository/book-source-metadata-prisma.repository';
import { BookSourceMetadataRepository } from './repository/book-source-metadata.repository';

@Module({
  imports: [
    DatabaseProviderModule,
    BookModule,
    BookAssetModule,
    StorageProviderModule,
    EncryptionProviderModule,
  ],
  providers: [
    BookProcessingService,
    { provide: BookSourceMetadataRepository, useClass: BookSourceMetadataPrismaRepository },
    { provide: BookChapterRepository, useClass: BookChapterPrismaRepository },
  ],
  exports: [BookProcessingService],
})
export class BookProcessingModule {}
