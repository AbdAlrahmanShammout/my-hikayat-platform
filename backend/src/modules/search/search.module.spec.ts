import { Test, TestingModule } from '@nestjs/testing';

import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { SearchModule } from './search.module';
import { SearchService } from './search.service';

describe('SearchModule', () => {
  it('exports the search service', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [SearchModule],
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
        category: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        user: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
        bookChapter: { findMany: jest.fn(), count: jest.fn() },
        bookPageTextLayer: { findMany: jest.fn(), count: jest.fn() },
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
      })
      .compile();
    expect(moduleRef.get(SearchService)).toBeDefined();
    await moduleRef.close();
  });
});
