import { Test, TestingModule } from '@nestjs/testing';

import { ConfigsModule } from '@/config/configs.module';
import { BookEngagementRepository } from '@/modules/monetization/repository/book-engagement.repository';
import { BookRevenueRepository } from '@/modules/monetization/repository/book-revenue.repository';
import { RevenuePeriodRepository } from '@/modules/monetization/repository/revenue-period.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { AuthorAnalyticsService } from './author-analytics.service';
import { BookEngagementService } from './book-engagement.service';
import { BookRevenueService } from './book-revenue.service';
import { MonetizationModule } from './monetization.module';
import { RevenuePeriodService } from './revenue-period.service';

describe('MonetizationModule', () => {
  it('binds the abstract repositories and exports the services', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigsModule, MonetizationModule],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
        revenuePeriod: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        bookEngagement: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
          upsert: jest.fn(),
          updateMany: jest.fn(),
          aggregate: jest.fn(),
        },
        bookRevenue: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
          upsert: jest.fn(),
          updateMany: jest.fn(),
          aggregate: jest.fn(),
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
          groupBy: jest.fn(),
        },
        readingVisualEngagement: {
          upsert: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
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
    expect(moduleRef.get(RevenuePeriodService)).toBeDefined();
    expect(moduleRef.get(BookEngagementService)).toBeDefined();
    expect(moduleRef.get(BookRevenueService)).toBeDefined();
    expect(moduleRef.get(AuthorAnalyticsService)).toBeDefined();
    expect(moduleRef.get(RevenuePeriodRepository)).toBeDefined();
    expect(moduleRef.get(BookEngagementRepository)).toBeDefined();
    expect(moduleRef.get(BookRevenueRepository)).toBeDefined();
    await moduleRef.close();
  });
});
