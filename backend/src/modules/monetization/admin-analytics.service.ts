import { Injectable } from '@nestjs/common';

import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookEngagementService } from '@/modules/monetization/book-engagement.service';
import { BookRevenueService } from '@/modules/monetization/book-revenue.service';
import { ENGAGEMENT_MS_PER_MINUTE } from '@/modules/monetization/consts/engagement-ms-per-minute.constant';
import {
  AdminPeriodAnalyticsPage,
  AdminPeriodBookHeatmap,
  AdminPeriodEarningsPage,
  AggregateAdminPeriodEngagementServiceInput,
  CalculateAdminPeriodRevenueServiceInput,
  GetAdminPeriodBookHeatmapServiceInput,
  ListAdminPeriodAnalyticsServiceInput,
  ListAdminPeriodEarningsServiceInput,
} from '@/modules/monetization/defs/admin-analytics-service.defs';
import { OwnerBookEngagementSummary } from '@/modules/monetization/defs/book-engagement-repository.defs';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { computePlatformCutCents } from '@/modules/monetization/platform-cut-cents.helper';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';
import { ReadingIntelligenceService } from '@/modules/reading-intelligence/reading-intelligence.service';

@Injectable()
export class AdminAnalyticsService {
  constructor(
    private readonly revenuePeriodService: RevenuePeriodService,
    private readonly bookRevenueService: BookRevenueService,
    private readonly bookEngagementService: BookEngagementService,
    private readonly bookService: BookService,
    private readonly readingIntelligenceService: ReadingIntelligenceService,
  ) {}

  async listPeriodEarnings(
    input: ListAdminPeriodEarningsServiceInput,
  ): Promise<AdminPeriodEarningsPage> {
    const period: RevenuePeriodEntity = await this.revenuePeriodService.getRevenuePeriodById(
      input.revenuePeriodId,
    );
    const page = await this.bookRevenueService.listBookRevenues({
      revenuePeriodId: period.id,
      ownerId: input.ownerId,
      limit: input.limit,
      offset: input.offset,
    });
    const authorCents: number = await this.bookRevenueService.sumAuthorCentsForPeriod({
      revenuePeriodId: period.id,
      ownerId: input.ownerId,
    });
    return {
      period,
      page,
      authorCents,
      platformCutCents: AdminAnalyticsService.resolvePlatformCutCents(period),
    };
  }

  async listPeriodAnalytics(
    input: ListAdminPeriodAnalyticsServiceInput,
  ): Promise<AdminPeriodAnalyticsPage> {
    const period: RevenuePeriodEntity = await this.revenuePeriodService.getRevenuePeriodById(
      input.revenuePeriodId,
    );
    const page = await this.bookEngagementService.listBookEngagements({
      revenuePeriodId: period.id,
      ownerId: input.ownerId,
      limit: input.limit,
      offset: input.offset,
    });
    const summary: OwnerBookEngagementSummary =
      await this.bookEngagementService.summarizeOwnerEngagementForPeriod({
        revenuePeriodId: period.id,
        ownerId: input.ownerId,
      });
    return {
      period,
      page,
      totalActiveReadingMs: summary.totalActiveReadingMs,
      totalActiveSpreadMs: summary.totalActiveSpreadMs,
      totalVisualSceneTimeMs: summary.totalVisualSceneTimeMs,
      totalWeightedEngagement: summary.totalWeightedEngagement,
      totalReadingMinutes: AdminAnalyticsService.toReadingMinutes(summary),
    };
  }

  async getPeriodBookHeatmap(
    input: GetAdminPeriodBookHeatmapServiceInput,
  ): Promise<AdminPeriodBookHeatmap> {
    const book: BookEntity = await this.bookService.getBookById(input.bookId);
    const period: RevenuePeriodEntity = await this.revenuePeriodService.getRevenuePeriodById(
      input.revenuePeriodId,
    );
    const cells = await this.readingIntelligenceService.listSpreadEngagementTotalsForBook({
      bookId: book.id,
      startsAt: period.startsAt,
      endsAt: period.endsAt,
    });
    return { bookId: book.id, revenuePeriodId: period.id, cells };
  }

  async calculatePeriodRevenue(
    input: CalculateAdminPeriodRevenueServiceInput,
  ): Promise<AdminPeriodEarningsPage> {
    await this.bookRevenueService.calculatePeriodRevenue({
      revenuePeriodId: input.revenuePeriodId,
    });
    return this.listPeriodEarnings({ revenuePeriodId: input.revenuePeriodId });
  }

  async aggregatePeriodEngagement(
    input: AggregateAdminPeriodEngagementServiceInput,
  ): Promise<AdminPeriodAnalyticsPage> {
    await this.bookEngagementService.aggregatePeriodEngagement({
      revenuePeriodId: input.revenuePeriodId,
    });
    return this.listPeriodAnalytics({ revenuePeriodId: input.revenuePeriodId });
  }

  private static resolvePlatformCutCents(period: RevenuePeriodEntity): number | null {
    if (period.poolAmountCents === null) {
      return null;
    }
    return computePlatformCutCents({
      poolAmountCents: period.poolAmountCents,
      platformCutPercent: period.platformCutPercent,
    });
  }

  private static toReadingMinutes(summary: OwnerBookEngagementSummary): number {
    return (summary.totalActiveReadingMs + summary.totalActiveSpreadMs) / ENGAGEMENT_MS_PER_MINUTE;
  }
}
