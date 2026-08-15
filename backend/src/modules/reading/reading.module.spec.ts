import { Test, TestingModule } from '@nestjs/testing';

import { ConfigsModule } from '@/config/configs.module';
import { ReadingBookmarkRepository } from '@/modules/reading/repository/reading-bookmark.repository';
import { ReadingProgressRepository } from '@/modules/reading/repository/reading-progress.repository';
import { ReadingSessionRepository } from '@/modules/reading/repository/reading-session.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { ReadingBookmarkService } from './reading-bookmark.service';
import { ReadingProgressService } from './reading-progress.service';
import { ReadingSessionTotalsService } from './reading-session-totals.service';
import { ReadingSessionService } from './reading-session.service';
import { ReadingSyncService } from './reading-sync.service';
import { ReadingModule } from './reading.module';

describe('ReadingModule', () => {
  it('binds the abstract repositories and exports the reading services', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigsModule, ReadingModule],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
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
          groupBy: jest.fn(),
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
      })
      .compile();
    expect(moduleRef.get(ReadingBookmarkService)).toBeDefined();
    expect(moduleRef.get(ReadingProgressService)).toBeDefined();
    expect(moduleRef.get(ReadingSessionService)).toBeDefined();
    expect(moduleRef.get(ReadingSessionTotalsService)).toBeDefined();
    expect(moduleRef.get(ReadingSyncService)).toBeDefined();
    expect(moduleRef.get(ReadingBookmarkRepository)).toBeDefined();
    expect(moduleRef.get(ReadingProgressRepository)).toBeDefined();
    expect(moduleRef.get(ReadingSessionRepository)).toBeDefined();
    await moduleRef.close();
  });
});
