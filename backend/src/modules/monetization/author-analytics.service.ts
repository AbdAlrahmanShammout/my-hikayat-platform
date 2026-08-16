import { Injectable } from '@nestjs/common';

import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookEngagementService } from '@/modules/monetization/book-engagement.service';
import { BookHeatmapService } from '@/modules/monetization/book-heatmap.service';
import { BookRevenueService } from '@/modules/monetization/book-revenue.service';
import { ENGAGEMENT_MS_PER_MINUTE } from '@/modules/monetization/consts/engagement-ms-per-minute.constant';
import {
  AuthorAnalyticsPage,
  AuthorBookHeatmap,
  AuthorEarningsPage,
  AuthorEarningsTrendPage,
  AuthorEarningsTrendPoint,
  GetAuthorBookHeatmapServiceInput,
  ListAuthorAnalyticsServiceInput,
  ListAuthorEarningsServiceInput,
  ListAuthorEarningsTrendServiceInput,
} from '@/modules/monetization/defs/author-analytics-service.defs';
import { OwnerBookEngagementSummary } from '@/modules/monetization/defs/book-engagement-repository.defs';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodPage } from '@/modules/monetization/defs/revenue-period-repository.defs';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';

@Injectable()
export class AuthorAnalyticsService {
  constructor(
    private readonly bookRevenueService: BookRevenueService,
    private readonly bookEngagementService: BookEngagementService,
    private readonly revenuePeriodService: RevenuePeriodService,
    private readonly bookService: BookService,
    private readonly bookHeatmapService: BookHeatmapService,
  ) {}

  async listAuthorEarnings(input: ListAuthorEarningsServiceInput): Promise<AuthorEarningsPage> {
    const page = await this.bookRevenueService.listBookRevenues({
      revenuePeriodId: input.revenuePeriodId,
      ownerId: input.ownerId,
      limit: input.limit,
      offset: input.offset,
    });
    const authorCents: number = await this.bookRevenueService.sumAuthorCentsForPeriod({
      revenuePeriodId: input.revenuePeriodId,
      ownerId: input.ownerId,
    });
    return { page, authorCents };
  }

  async listAuthorEarningsTrend(
    input: ListAuthorEarningsTrendServiceInput,
  ): Promise<AuthorEarningsTrendPage> {
    const periods: RevenuePeriodPage = await this.revenuePeriodService.listRevenuePeriods({
      limit: input.limit,
      offset: input.offset,
    });
    const entities: AuthorEarningsTrendPoint[] = await Promise.all(
      periods.entities.map(async (period) => {
        const authorCents: number = await this.bookRevenueService.sumAuthorCentsForPeriod({
          revenuePeriodId: period.id,
          ownerId: input.ownerId,
        });
        return { period, authorCents };
      }),
    );
    return { entities, total: periods.total };
  }

  async listAuthorAnalytics(input: ListAuthorAnalyticsServiceInput): Promise<AuthorAnalyticsPage> {
    const page = await this.bookEngagementService.listBookEngagements({
      revenuePeriodId: input.revenuePeriodId,
      ownerId: input.ownerId,
      limit: input.limit,
      offset: input.offset,
    });
    const summary: OwnerBookEngagementSummary =
      await this.bookEngagementService.summarizeOwnerEngagementForPeriod({
        revenuePeriodId: input.revenuePeriodId,
        ownerId: input.ownerId,
      });
    return {
      page,
      totalActiveReadingMs: summary.totalActiveReadingMs,
      totalActiveSpreadMs: summary.totalActiveSpreadMs,
      totalVisualSceneTimeMs: summary.totalVisualSceneTimeMs,
      totalWeightedEngagement: summary.totalWeightedEngagement,
      totalReadingMinutes: AuthorAnalyticsService.toReadingMinutes(summary),
    };
  }

  async getAuthorBookHeatmap(input: GetAuthorBookHeatmapServiceInput): Promise<AuthorBookHeatmap> {
    const book: BookEntity = await this.requireOwnedBook(input.bookId, input.ownerId);
    const period: RevenuePeriodEntity = await this.revenuePeriodService.getRevenuePeriodById(
      input.revenuePeriodId,
    );
    return this.bookHeatmapService.getBookHeatmap({ book, period });
  }

  private async requireOwnedBook(bookId: number, ownerId: number): Promise<BookEntity> {
    const book: BookEntity = await this.bookService.getBookById(bookId);
    if (book.ownerId !== ownerId) {
      throw new ResourceNotFoundException('Book', bookId);
    }
    return book;
  }

  private static toReadingMinutes(summary: OwnerBookEngagementSummary): number {
    return (summary.totalActiveReadingMs + summary.totalActiveSpreadMs) / ENGAGEMENT_MS_PER_MINUTE;
  }
}
