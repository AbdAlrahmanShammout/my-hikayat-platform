import { Module } from '@nestjs/common';

import { AuditModule } from '@/modules/audit/audit.module';
import { BookModule } from '@/modules/book/book.module';
import { BookProcessingModule } from '@/modules/book-processing/book-processing.module';
import { ReadingIntelligenceModule } from '@/modules/reading-intelligence/reading-intelligence.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { AdminAnalyticsService } from './admin-analytics.service';
import { AuthorAnalyticsService } from './author-analytics.service';
import { BookEngagementService } from './book-engagement.service';
import { BookHeatmapService } from './book-heatmap.service';
import { BookRevenueService } from './book-revenue.service';
import { BookEngagementPrismaRepository } from './repository/book-engagement-prisma.repository';
import { BookEngagementRepository } from './repository/book-engagement.repository';
import { BookRevenuePrismaRepository } from './repository/book-revenue-prisma.repository';
import { BookRevenueRepository } from './repository/book-revenue.repository';
import { RevenuePeriodPrismaRepository } from './repository/revenue-period-prisma.repository';
import { RevenuePeriodRepository } from './repository/revenue-period.repository';
import { RevenuePeriodService } from './revenue-period.service';

@Module({
  imports: [
    DatabaseProviderModule,
    BookModule,
    BookProcessingModule,
    ReadingIntelligenceModule,
    AuditModule,
  ],
  providers: [
    RevenuePeriodService,
    BookEngagementService,
    BookRevenueService,
    BookHeatmapService,
    AuthorAnalyticsService,
    AdminAnalyticsService,
    { provide: RevenuePeriodRepository, useClass: RevenuePeriodPrismaRepository },
    { provide: BookEngagementRepository, useClass: BookEngagementPrismaRepository },
    { provide: BookRevenueRepository, useClass: BookRevenuePrismaRepository },
  ],
  exports: [
    RevenuePeriodService,
    BookEngagementService,
    BookRevenueService,
    AuthorAnalyticsService,
    AdminAnalyticsService,
  ],
})
export class MonetizationModule {}
