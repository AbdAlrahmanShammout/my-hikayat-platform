import { Injectable } from '@nestjs/common';

import { BookService } from '@/modules/book/book.service';
import { BookPage } from '@/modules/book/defs/book-repository.defs';
import { BookPublishingStatus } from '@/modules/book/enum/general.enum';
import { BookEngagementService } from '@/modules/monetization/book-engagement.service';
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
}
