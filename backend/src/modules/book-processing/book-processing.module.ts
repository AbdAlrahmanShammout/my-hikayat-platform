import { Module } from '@nestjs/common';

import { BookModule } from '@/modules/book/book.module';
import { BookAssetModule } from '@/modules/book-asset/book-asset.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';
import { EncryptionProviderModule } from '@/providers/encryption/encryption-provider.module';
import { JobProviderModule } from '@/providers/job/job-provider.module';
import { StorageProviderModule } from '@/providers/storage/storage-provider.module';

import { BookProcessingOrchestrationService } from './book-processing-orchestration.service';
import { BookProcessingService } from './book-processing.service';
import { JobEventHandlersImplementsService } from './job-event-handlers-implements.service';
import { BookChapterPrismaRepository } from './repository/book-chapter-prisma.repository';
import { BookChapterRepository } from './repository/book-chapter.repository';
import { BookPagePrismaRepository } from './repository/book-page-prisma.repository';
import { BookPageRepository } from './repository/book-page.repository';
import { BookPageTextLayerPrismaRepository } from './repository/book-page-text-layer-prisma.repository';
import { BookPageTextLayerRepository } from './repository/book-page-text-layer.repository';
import { BookPageTextRunPrismaRepository } from './repository/book-page-text-run-prisma.repository';
import { BookPageTextRunRepository } from './repository/book-page-text-run.repository';
import { BookSpreadPrismaRepository } from './repository/book-spread-prisma.repository';
import { BookSpreadRepository } from './repository/book-spread.repository';
import { BookSourceMetadataPrismaRepository } from './repository/book-source-metadata-prisma.repository';
import { BookSourceMetadataRepository } from './repository/book-source-metadata.repository';

@Module({
  imports: [
    DatabaseProviderModule,
    BookModule,
    BookAssetModule,
    StorageProviderModule,
    EncryptionProviderModule,
    JobProviderModule,
  ],
  providers: [
    BookProcessingService,
    BookProcessingOrchestrationService,
    JobEventHandlersImplementsService,
    { provide: BookSourceMetadataRepository, useClass: BookSourceMetadataPrismaRepository },
    { provide: BookChapterRepository, useClass: BookChapterPrismaRepository },
    { provide: BookPageRepository, useClass: BookPagePrismaRepository },
    { provide: BookSpreadRepository, useClass: BookSpreadPrismaRepository },
    { provide: BookPageTextLayerRepository, useClass: BookPageTextLayerPrismaRepository },
    { provide: BookPageTextRunRepository, useClass: BookPageTextRunPrismaRepository },
  ],
  exports: [BookProcessingService, BookProcessingOrchestrationService],
})
export class BookProcessingModule {}
