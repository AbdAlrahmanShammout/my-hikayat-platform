import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';

import { ConfigsModule } from '@/config/configs.module';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { ReaderApiModule } from './reader-api.module';

describe('ReaderApiModule', () => {
  it('compiles with authentication and the user reader API', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigsModule,
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
        ReaderApiModule,
      ],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
        user: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
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
        category: {
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
        readingSession: {
          create: jest.fn(),
          findFirst: jest.fn(),
          update: jest.fn(),
        },
        readingVisualEngagement: {
          upsert: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
        },
        collection: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        collectionBook: {
          createMany: jest.fn(),
          deleteMany: jest.fn(),
        },
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
    const actualModule: ReaderApiModule = moduleRef.get(ReaderApiModule);
    expect(actualModule).toBeDefined();
    await moduleRef.close();
  });
});
