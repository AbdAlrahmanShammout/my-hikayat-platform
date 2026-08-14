import { Test, TestingModule } from '@nestjs/testing';

import { BookAssetRepository } from '@/modules/book-asset/repository/book-asset.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { BookAssetModule } from './book-asset.module';
import { BookAssetService } from './book-asset.service';

describe('BookAssetModule', () => {
  it('binds the abstract repository and exports the service', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [BookAssetModule],
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
      })
      .compile();
    expect(moduleRef.get(BookAssetService)).toBeDefined();
    expect(moduleRef.get(BookAssetRepository)).toBeDefined();
    await moduleRef.close();
  });
});
