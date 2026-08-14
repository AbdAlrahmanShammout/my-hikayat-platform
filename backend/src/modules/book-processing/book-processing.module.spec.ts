import { Test, TestingModule } from '@nestjs/testing';

import { ConfigsModule } from '@/config/configs.module';
import { BookAssetRepository } from '@/modules/book-asset/repository/book-asset.repository';
import { BookSourceMetadataRepository } from '@/modules/book-processing/repository/book-source-metadata.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

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
    expect(moduleRef.get(BookSourceMetadataRepository)).toBeDefined();
    expect(moduleRef.get(BookAssetRepository)).toBeDefined();
    await moduleRef.close();
  });
});
