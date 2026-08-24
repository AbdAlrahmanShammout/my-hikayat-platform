import { Test, TestingModule } from '@nestjs/testing';

import { ConfigsModule } from '@/config/configs.module';
import { BookAssetRepository } from '@/modules/book-asset/repository/book-asset.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { BookAssetCatalogMediaService } from './book-asset-catalog-media.service';
import { BookAssetContentKeyService } from './book-asset-content-key.service';
import { BookAssetDeliveryService } from './book-asset-delivery.service';
import { BookAssetSourceService } from './book-asset-source.service';
import { BookAssetModule } from './book-asset.module';
import { BookAssetService } from './book-asset.service';

describe('BookAssetModule', () => {
  it('binds the abstract repository and exports the services', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigsModule, BookAssetModule],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
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
        plan: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
        },
        subscription: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        readingSession: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        readingProgress: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        readingBookmark: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        auditLog: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
        },
      })
      .compile();
    expect(moduleRef.get(BookAssetService)).toBeDefined();
    expect(moduleRef.get(BookAssetSourceService)).toBeDefined();
    expect(moduleRef.get(BookAssetCatalogMediaService)).toBeDefined();
    expect(moduleRef.get(BookAssetDeliveryService)).toBeDefined();
    expect(moduleRef.get(BookAssetContentKeyService)).toBeDefined();
    expect(moduleRef.get(BookAssetRepository)).toBeDefined();
    await moduleRef.close();
  });
});
