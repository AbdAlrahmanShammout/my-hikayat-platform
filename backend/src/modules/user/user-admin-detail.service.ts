import { Injectable } from '@nestjs/common';

import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookCatalogCoverService } from '@/modules/book-asset/book-catalog-cover.service';
import { BookCatalogCover } from '@/modules/book-asset/defs/book-asset-service.defs';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { BookChapterEntity } from '@/modules/book-processing/entity/book-chapter.entity';
import { BookPageEntity } from '@/modules/book-processing/entity/book-page.entity';
import { BookSpreadEntity } from '@/modules/book-processing/entity/book-spread.entity';
import { ReadingProgressPage } from '@/modules/reading/defs/reading-progress-repository.defs';
import { BookActiveDurationTotal } from '@/modules/reading/defs/reading-session-repository.defs';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';
import { ReadingProgressService } from '@/modules/reading/reading-progress.service';
import { ReadingSessionTotalsService } from '@/modules/reading/reading-session-totals.service';
import { SubscriptionPeriodProgress } from '@/modules/subscription/defs/subscription-period-progress.defs';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { resolveSubscriptionPeriodProgress } from '@/modules/subscription/resolve-subscription-period-progress.helper';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { buildAdminUserReadingProgressItems } from '@/modules/user/build-admin-user-reading-progress-items.helper';
import { ADMIN_USER_READING_PROGRESS_LIMIT } from '@/modules/user/consts/admin-user-reading-progress-limit.constant';
import { AdminUserDetail } from '@/modules/user/defs/user-admin-detail-service.defs';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserService } from '@/modules/user/user.service';

type ReadingSupportData = {
  readonly books: readonly BookEntity[];
  readonly coverByBookId: ReadonlyMap<number, BookCatalogCover | null>;
  readonly chapters: readonly BookChapterEntity[];
  readonly pages: readonly BookPageEntity[];
  readonly spreads: readonly BookSpreadEntity[];
  readonly durationTotals: readonly BookActiveDurationTotal[];
};

@Injectable()
export class UserAdminDetailService {
  constructor(
    private readonly userService: UserService,
    private readonly subscriptionService: SubscriptionService,
    private readonly readingProgressService: ReadingProgressService,
    private readonly readingSessionTotalsService: ReadingSessionTotalsService,
    private readonly bookService: BookService,
    private readonly bookProcessingService: BookProcessingService,
    private readonly bookCatalogCoverService: BookCatalogCoverService,
  ) {}

  /**
   * Loads one managed user with canonical subscription and reading-progress projections.
   */
  async getAdminUserDetail(userId: number, now: Date = new Date()): Promise<AdminUserDetail> {
    const user: UserEntity = await this.userService.getUserById(userId);
    const [subscription, progressPage]: [SubscriptionEntity | null, ReadingProgressPage] =
      await Promise.all([
        this.subscriptionService.findSubscriptionByUserId(userId),
        this.readingProgressService.listReadingProgresses({
          userId,
          limit: ADMIN_USER_READING_PROGRESS_LIMIT,
          offset: 0,
        }),
      ]);
    const periodProgress: SubscriptionPeriodProgress = resolveSubscriptionPeriodProgress(
      subscription,
      now,
    );
    if (progressPage.entities.length === 0) {
      return { user, subscription, periodProgress, readingItems: [] };
    }
    const support: ReadingSupportData = await this.loadReadingSupport(userId, progressPage.entities);
    return {
      user,
      subscription,
      periodProgress,
      readingItems: buildAdminUserReadingProgressItems({
        progressRows: progressPage.entities,
        books: support.books,
        coverByBookId: support.coverByBookId,
        chapters: support.chapters,
        pages: support.pages,
        spreads: support.spreads,
        durationTotals: support.durationTotals,
      }),
    };
  }

  private async loadReadingSupport(
    userId: number,
    progressRows: readonly ReadingProgressEntity[],
  ): Promise<ReadingSupportData> {
    const bookIds: number[] = [...new Set(progressRows.map((row) => row.bookId))];
    const reflowableBookIds: number[] = bookIdsForLayout(progressRows, BookLayoutType.REFLOWABLE);
    const fixedLayoutBookIds: number[] = bookIdsForLayout(
      progressRows,
      BookLayoutType.FIXED_LAYOUT,
    );
    const [books, chapters, pages, spreads, durationTotals]: [
      BookEntity[],
      BookChapterEntity[],
      BookPageEntity[],
      BookSpreadEntity[],
      BookActiveDurationTotal[],
    ] = await Promise.all([
      this.bookService.listBooksByIds(bookIds),
      this.bookProcessingService.listChaptersByBookIds(reflowableBookIds),
      this.bookProcessingService.listPagesByBookIds(fixedLayoutBookIds),
      this.bookProcessingService.listSpreadsByBookIds(fixedLayoutBookIds),
      this.readingSessionTotalsService.sumActiveDurationByBookForUser(userId),
    ]);
    const coverByBookId: ReadonlyMap<number, BookCatalogCover | null> =
      await this.bookCatalogCoverService.resolveCoverByBookId(books.map((book) => book.id));
    return { books, coverByBookId, chapters, pages, spreads, durationTotals };
  }
}

function bookIdsForLayout(
  progressRows: readonly ReadingProgressEntity[],
  layoutType: BookLayoutType,
): number[] {
  return [
    ...new Set(
      progressRows
        .filter((row) => row.layoutType === layoutType)
        .map((row) => row.bookId),
    ),
  ];
}
