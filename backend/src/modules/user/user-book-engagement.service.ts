import { Injectable } from '@nestjs/common';

import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { ChapterDurationTotal } from '@/modules/reading-intelligence/defs/reading-chapter-engagement-repository.defs';
import { SpreadVisualDurationTotal } from '@/modules/reading-intelligence/defs/reading-visual-engagement-repository.defs';
import { ReadingChapterEngagementService } from '@/modules/reading-intelligence/reading-chapter-engagement.service';
import { ReadingVisualEngagementService } from '@/modules/reading-intelligence/reading-visual-engagement.service';
import { ReadingSessionTotalsService } from '@/modules/reading/reading-session-totals.service';
import { UserService } from '@/modules/user/user.service';

export type UserBookChapterEngagement = {
  readonly spineIndex: number;
  readonly title: string | null;
  readonly activeDurationMs: number;
};

export type UserBookEngagement = {
  readonly userId: number;
  readonly bookId: number;
  readonly layoutType: BookLayoutType | null;
  readonly activeDurationMs: number;
  readonly chapters: readonly UserBookChapterEngagement[];
  readonly spreads: readonly SpreadVisualDurationTotal[];
};

@Injectable()
export class UserBookEngagementService {
  constructor(
    private readonly userService: UserService,
    private readonly bookService: BookService,
    private readonly bookProcessingService: BookProcessingService,
    private readonly readingSessionTotalsService: ReadingSessionTotalsService,
    private readonly readingChapterEngagementService: ReadingChapterEngagementService,
    private readonly readingVisualEngagementService: ReadingVisualEngagementService,
  ) {}

  async getEngagement(userId: number, bookId: number): Promise<UserBookEngagement> {
    await this.userService.getUserById(userId);
    const book: BookEntity = await this.bookService.getBookById(bookId);
    const durationTotals =
      await this.readingSessionTotalsService.sumActiveDurationByBookForUser(userId);
    const activeDurationMs: number =
      durationTotals.find((total) => total.bookId === bookId)?.activeDurationMs ?? 0;
    if (book.layoutType === BookLayoutType.FIXED_LAYOUT) {
      const spreads: SpreadVisualDurationTotal[] =
        await this.readingVisualEngagementService.sumDurationsBySpreadForUser({ userId, bookId });
      return {
        userId,
        bookId,
        layoutType: book.layoutType,
        activeDurationMs,
        chapters: [],
        spreads,
      };
    }
    const chapters: ChapterDurationTotal[] =
      await this.readingChapterEngagementService.sumDurationsByChapterForUser({ userId, bookId });
    const titles = await this.bookProcessingService.listChaptersByBookIds(
      book.layoutType === BookLayoutType.REFLOWABLE ? [bookId] : [],
    );
    return {
      userId,
      bookId,
      layoutType: book.layoutType,
      activeDurationMs,
      spreads: [],
      chapters: chapters.map((chapter) => ({
        spineIndex: chapter.spineIndex,
        title: titles.find((row) => row.spineIndex === chapter.spineIndex)?.title ?? null,
        activeDurationMs: chapter.activeDurationMs,
      })),
    };
  }
}
