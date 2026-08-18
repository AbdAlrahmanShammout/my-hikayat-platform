import { Injectable } from '@nestjs/common';

import { BookService } from '@/modules/book/book.service';
import { BookPage } from '@/modules/book/defs/book-repository.defs';
import { BookPublishingStatus } from '@/modules/book/enum/general.enum';
import { BookEngagementService } from '@/modules/monetization/book-engagement.service';
import { BookRevenueService } from '@/modules/monetization/book-revenue.service';
import { DASHBOARD_COUNT_PAGE_SIZE } from '@/modules/monetization/consts/dashboard-count-page-size.constant';
import { OwnerBookEngagementSummary } from '@/modules/monetization/defs/book-engagement-repository.defs';
import {
  AuthorDashboardSummary,
  GetAuthorDashboardSummaryServiceInput,
} from '@/modules/monetization/defs/author-dashboard-summary-service.defs';
import { toReadingMinutes } from '@/modules/monetization/to-reading-minutes.helper';

@Injectable()
export class AuthorDashboardSummaryService {
  constructor(
    private readonly bookService: BookService,
    private readonly bookEngagementService: BookEngagementService,
    private readonly bookRevenueService: BookRevenueService,
  ) {}

  /**
   * Builds owner-scoped Home KPIs from existing book, engagement, and revenue totals.
   */
  async getAuthorDashboardSummary(
    input: GetAuthorDashboardSummaryServiceInput,
  ): Promise<AuthorDashboardSummary> {
    const [booksPage, pendingPage, publishedBooks, engagement, authorCents]: [
      BookPage,
      BookPage,
      number,
      OwnerBookEngagementSummary,
      number,
    ] = await Promise.all([
      this.bookService.listBooks({
        limit: DASHBOARD_COUNT_PAGE_SIZE,
        ownerId: input.ownerId,
      }),
      this.bookService.listBooks({
        limit: DASHBOARD_COUNT_PAGE_SIZE,
        ownerId: input.ownerId,
        publishingStatus: BookPublishingStatus.IN_REVIEW,
      }),
      this.bookService.countCatalogVisibleBooks({ ownerId: input.ownerId }),
      this.bookEngagementService.summarizeOwnerEngagement({ ownerId: input.ownerId }),
      this.bookRevenueService.sumAuthorCents({ ownerId: input.ownerId }),
    ]);
    return {
      totalBooks: booksPage.total,
      publishedBooks,
      pendingReviewBooks: pendingPage.total,
      totalReadingMinutes: toReadingMinutes(engagement),
      authorCents,
    };
  }
}
