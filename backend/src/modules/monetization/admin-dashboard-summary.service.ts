import { Injectable } from '@nestjs/common';

import { BookService } from '@/modules/book/book.service';
import { BookPage } from '@/modules/book/defs/book-repository.defs';
import { BookPublishingStatus } from '@/modules/book/enum/general.enum';
import { BookEngagementService } from '@/modules/monetization/book-engagement.service';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ENGAGEMENT_MS_PER_MINUTE } from '@/modules/monetization/consts/engagement-ms-per-minute.constant';
import { DASHBOARD_COUNT_PAGE_SIZE } from '@/modules/monetization/consts/dashboard-count-page-size.constant';
import { AdminDashboardSummary } from '@/modules/monetization/defs/admin-dashboard-summary-service.defs';
import { OwnerBookEngagementSummary } from '@/modules/monetization/defs/book-engagement-repository.defs';
import { toReadingMinutes } from '@/modules/monetization/to-reading-minutes.helper';
import { UserPage } from '@/modules/user/defs/user-repository.defs';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class AdminDashboardSummaryService {
  constructor(
    private readonly userService: UserService,
    private readonly bookService: BookService,
    private readonly bookEngagementService: BookEngagementService,
  ) {}

  /**
   * Builds platform-wide Home KPIs from existing user, book, and engagement totals.
   */
  async getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
    const [usersPage, publishersPage, booksPage, pendingPage, publishedBooks, engagement]: [
      UserPage,
      UserPage,
      BookPage,
      BookPage,
      number,
      OwnerBookEngagementSummary,
    ] = await Promise.all([
      this.userService.listUsers({ limit: DASHBOARD_COUNT_PAGE_SIZE }),
      this.userService.listUsers({
        limit: DASHBOARD_COUNT_PAGE_SIZE,
        isPublisher: true,
      }),
      this.bookService.listBooks({ limit: DASHBOARD_COUNT_PAGE_SIZE }),
      this.bookService.listBooks({
        limit: DASHBOARD_COUNT_PAGE_SIZE,
        publishingStatus: BookPublishingStatus.IN_REVIEW,
      }),
      this.bookService.countCatalogVisibleBooks(),
      this.bookEngagementService.summarizeOwnerEngagement({}),
    ]);
    return {
      totalUsers: usersPage.total,
      totalPublishers: publishersPage.total,
      totalBooks: booksPage.total,
      publishedBooks,
      pendingReviewBooks: pendingPage.total,
      totalReadingMinutes: toReadingMinutes(engagement),
    };
  }

  /**
   * Books that produced the home reading-minutes KPI. Uses BookEngagement only.
   * Empty when no revenue period has been aggregated, even if reading sessions exist.
   */
  async listReadingDrilldown(input: {
    readonly limit?: number;
    readonly offset?: number;
    readonly ownerId?: number;
  }): Promise<{
    readonly totalReadingMinutes: number;
    readonly total: number;
    readonly bookEngagements: readonly {
      readonly bookId: number;
      readonly title: string;
      readonly ownerId: number;
      readonly activeReadingMs: number;
      readonly activeSpreadMs: number;
      readonly readingMinutes: number;
    }[];
  }> {
    const [summary, rows] = await Promise.all([
      this.bookEngagementService.summarizeOwnerEngagement({ ownerId: input.ownerId }),
      this.bookEngagementService.listPaidReadingByBook({ ownerId: input.ownerId }),
    ]);
    const offset: number = input.offset ?? DEFAULT_PAGE_OFFSET;
    const limit: number = input.limit ?? DEFAULT_PAGE_SIZE;
    const page = rows.slice(offset, offset + limit);
    const books = await this.bookService.listBooksByIds(page.map((row) => row.bookId));
    return {
      totalReadingMinutes: toReadingMinutes(summary),
      total: rows.length,
      bookEngagements: page.map((row) => {
        const book = books.find((candidate) => candidate.id === row.bookId);
        const paidMs: number = row.activeReadingMs + row.activeSpreadMs;
        return {
          bookId: row.bookId,
          title: book?.title ?? '',
          ownerId: book?.ownerId ?? 0,
          activeReadingMs: row.activeReadingMs,
          activeSpreadMs: row.activeSpreadMs,
          readingMinutes: paidMs / ENGAGEMENT_MS_PER_MINUTE,
        };
      }),
    };
  }
}
