import { Test, TestingModule } from '@nestjs/testing';

import { ConfigsModule } from '@/config/configs.module';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { ReadingProgressPresentationModule } from './reading-progress-presentation.module';
import { ReadingProgressPresentationService } from './reading-progress-presentation.service';

describe('ReadingProgressPresentationModule', () => {
  it('exports the presentation service', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigsModule, ReadingProgressPresentationModule],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
        book: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        bookAsset: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
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
    expect(moduleRef.get(ReadingProgressPresentationService)).toBeDefined();
    expect(moduleRef.get(BookProcessingService)).toBeDefined();
    await moduleRef.close();
  });
});
