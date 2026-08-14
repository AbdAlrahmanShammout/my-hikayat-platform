import { Test, TestingModule } from '@nestjs/testing';

import { ConfigsModule } from '@/config/configs.module';
import { BookService } from '@/modules/book/book.service';
import { BookAssetRepository } from '@/modules/book-asset/repository/book-asset.repository';
import { BookSourceMetadataRepository } from '@/modules/book-processing/repository/book-source-metadata.repository';
import { BookChapterRepository } from '@/modules/book-processing/repository/book-chapter.repository';
import { BookPageRepository } from '@/modules/book-processing/repository/book-page.repository';
import { BookPageTextLayerRepository } from '@/modules/book-processing/repository/book-page-text-layer.repository';
import { BookPageTextRunRepository } from '@/modules/book-processing/repository/book-page-text-run.repository';
import { BookSpreadRepository } from '@/modules/book-processing/repository/book-spread.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { JobManagerService } from '@/providers/job/job-manager.service';

import { BookProcessingOrchestrationService } from './book-processing-orchestration.service';
import { BookProcessingModule } from './book-processing.module';
import { BookProcessingService } from './book-processing.service';

describe('BookProcessingModule', () => {
  it('exports the processing service', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigsModule, BookProcessingModule],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
        bookSourceMetadata: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        bookChapter: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
          deleteMany: jest.fn(),
        },
        bookPage: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
          deleteMany: jest.fn(),
        },
        bookSpread: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
          deleteMany: jest.fn(),
        },
        bookPageTextLayer: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
          deleteMany: jest.fn(),
        },
        bookPageTextRun: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
          deleteMany: jest.fn(),
        },
        bookAsset: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        book: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        category: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        user: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      })
      .compile();
    expect(moduleRef.get(BookProcessingService)).toBeDefined();
    expect(moduleRef.get(BookProcessingOrchestrationService)).toBeDefined();
    expect(moduleRef.get(JobManagerService)).toBeDefined();
    expect(moduleRef.get(BookService)).toBeDefined();
    expect(moduleRef.get(BookSourceMetadataRepository)).toBeDefined();
    expect(moduleRef.get(BookChapterRepository)).toBeDefined();
    expect(moduleRef.get(BookPageRepository)).toBeDefined();
    expect(moduleRef.get(BookSpreadRepository)).toBeDefined();
    expect(moduleRef.get(BookPageTextLayerRepository)).toBeDefined();
    expect(moduleRef.get(BookPageTextRunRepository)).toBeDefined();
    expect(moduleRef.get(BookAssetRepository)).toBeDefined();
    await moduleRef.close();
  });
});
