import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { TransactionRunner } from '@/common/base/transaction-runner';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookService } from '@/modules/book/book.service';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { PlatformSettingService } from '@/modules/platform-setting/platform-setting.service';
import { ReadingProgressService } from '@/modules/reading/reading-progress.service';
import { BookReadingStructure, ChapterWordSpan } from '@/modules/reading-completion/book-reading-structure';
import { buildVirtualPages } from '@/modules/reading-completion/build-virtual-pages.helper';
import { countWords } from '@/modules/reading-completion/count-words.helper';
import { BookReadingCycleEntity } from '@/modules/reading-completion/entity/book-reading-cycle.entity';
import { ReadingCompletionStatus } from '@/modules/reading-completion/enum/general.enum';
import { evaluateReadingCompletion } from '@/modules/reading-completion/evaluate-reading-completion.helper';
import { ReadingCycleNotCompletedException } from '@/modules/reading-completion/exceptions/reading-cycle-not-completed.exception';
import { BookReadingCycleRepository, CompletedReadCountRow } from '@/modules/reading-completion/repository/book-reading-cycle.repository';
import { resolveReadingPage } from '@/modules/reading-completion/resolve-reading-page.helper';

export type RecordReadingPageDwellInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly activeDurationMs: number;
  readonly pageNumber?: number;
  readonly spineIndex?: number;
  readonly scrollOffset?: number;
  readonly contentHeight?: number;
};

@Injectable()
export class BookReadingCycleService {
  constructor(
    private readonly bookReadingCycleRepository: BookReadingCycleRepository,
    private readonly bookService: BookService,
    private readonly bookProcessingService: BookProcessingService,
    private readonly readingProgressService: ReadingProgressService,
    private readonly platformSettingService: PlatformSettingService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async recordPageDwell(input: RecordReadingPageDwellInput): Promise<BookReadingCycleEntity | null> {
    if (input.activeDurationMs <= 0) {
      return this.bookReadingCycleRepository.findLatest(input.userId, input.bookId);
    }
    const book = await this.bookService.getBookById(input.bookId);
    if (book.layoutType === null) {
      return null;
    }
    const structure: BookReadingStructure = await this.loadStructure(input.bookId);
    const wordsPerPage: number = (await this.platformSettingService.getPlatformSettings()).wordsPerPage;
    const page = resolveReadingPage({
      layoutType: book.layoutType,
      pageNumber: input.pageNumber,
      spineIndex: input.spineIndex,
      scrollOffset: input.scrollOffset,
      contentHeight: input.contentHeight,
      fixedPageCount: structure.fixedPageCount,
      chapters: structure.chapters,
      wordsPerPage,
    });
    if (page === null) {
      return this.bookReadingCycleRepository.findLatest(input.userId, input.bookId);
    }
    const totalWords: number =
      book.layoutType === BookLayoutType.FIXED_LAYOUT ? structure.totalWords : page.totalWords;
    return this.transactionRunner.run((context) =>
      this.applyDwell(
        {
          userId: input.userId,
          bookId: input.bookId,
          layoutType: book.layoutType as BookLayoutType,
          pageIndex: page.pageIndex,
          totalPages: page.totalPages,
          totalWords,
          wordsPerPage,
          activeDurationMs: input.activeDurationMs,
          chapters: structure.chapters,
        },
        context,
      ),
    );
  }

  async startOver(input: { readonly userId: number; readonly bookId: number }): Promise<BookReadingCycleEntity> {
    const book = await this.bookService.getBookById(input.bookId);
    if (book.layoutType === null) {
      throw new ReadingCycleNotCompletedException();
    }
    return this.transactionRunner.run(async (context) => {
      const latest: BookReadingCycleEntity | null = await this.bookReadingCycleRepository.findLatest(
        input.userId,
        input.bookId,
        context,
      );
      if (latest === null || latest.status !== ReadingCompletionStatus.COMPLETED) {
        throw new ReadingCycleNotCompletedException();
      }
      const created: BookReadingCycleEntity = await this.bookReadingCycleRepository.create(
        {
          userId: input.userId,
          bookId: input.bookId,
          cycleNumber: latest.cycleNumber + 1,
          layoutType: book.layoutType as BookLayoutType,
        },
        context,
      );
      await this.readingProgressService.saveReadingProgress(
        book.layoutType === BookLayoutType.REFLOWABLE
          ? { userId: input.userId, bookId: input.bookId, spineIndex: 0, scrollOffset: 0 }
          : { userId: input.userId, bookId: input.bookId, spreadIndex: 0, pageNumber: 1 },
      );
      return created;
    });
  }

  async listStatuses(
    userId: number,
    bookIds: readonly number[],
  ): Promise<BookReadingCycleEntity[]> {
    return this.bookReadingCycleRepository.listLatestForBooks(userId, bookIds);
  }

  async listCompletedReadCounts(input: {
    readonly startsAt: Date;
    readonly endsAt: Date;
  }): Promise<CompletedReadCountRow[]> {
    return this.bookReadingCycleRepository.listCompletedReadCounts(input);
  }

  private async applyDwell(
    input: {
      readonly userId: number;
      readonly bookId: number;
      readonly layoutType: BookLayoutType;
      readonly pageIndex: number;
      readonly totalPages: number;
      readonly totalWords: number;
      readonly wordsPerPage: number;
      readonly activeDurationMs: number;
      readonly chapters: readonly ChapterWordSpan[];
    },
    context: TransactionContext,
  ): Promise<BookReadingCycleEntity> {
    const latest: BookReadingCycleEntity | null = await this.bookReadingCycleRepository.findLatest(
      input.userId,
      input.bookId,
      context,
    );
    if (latest !== null && latest.status === ReadingCompletionStatus.COMPLETED) {
      return latest;
    }
    const cycle: BookReadingCycleEntity =
      latest ??
      (await this.bookReadingCycleRepository.create(
        {
          userId: input.userId,
          bookId: input.bookId,
          cycleNumber: 1,
          layoutType: input.layoutType,
        },
        context,
      ));
    await this.bookReadingCycleRepository.addPageDwell(
      { cycleId: cycle.id, pageIndex: input.pageIndex, activeDurationMs: input.activeDurationMs },
      context,
    );
    const refreshed: BookReadingCycleEntity | null = await this.bookReadingCycleRepository.findLatest(
      input.userId,
      input.bookId,
      context,
    );
    if (refreshed === null) {
      return cycle;
    }
    const evaluation = evaluateReadingCompletion({
      layoutType: input.layoutType,
      totalPages: input.totalPages,
      totalWords: input.totalWords,
      virtualPages:
        input.layoutType === BookLayoutType.REFLOWABLE
          ? buildVirtualPages(input.totalWords, input.wordsPerPage)
          : undefined,
      pages: refreshed.pages ?? [],
    });
    return this.bookReadingCycleRepository.update(
      {
        id: refreshed.id,
        status: evaluation.isCompleted
          ? ReadingCompletionStatus.COMPLETED
          : ReadingCompletionStatus.IN_PROGRESS,
        lastPageRead: evaluation.lastPageRead,
        activeTimeMs: evaluation.activeTimeMs,
        qualifyingPageCount: evaluation.qualifyingPageCount,
        lastPageReached: evaluation.lastPageReached,
        completedAt: evaluation.isCompleted ? (refreshed.completedAt ?? new Date()) : null,
      },
      context,
    );
  }

  private async loadStructure(bookId: number): Promise<BookReadingStructure> {
    const [chapters, pages] = await Promise.all([
      this.bookProcessingService.listBookChapters(bookId),
      this.bookProcessingService.listPagesByBookIds([bookId]),
    ]);
    const chapterSpans: ChapterWordSpan[] = chapters.map((chapter) => ({
      spineIndex: chapter.spineIndex,
      wordCount: countWords(chapter.contentText),
    }));
    const totalWords: number = chapterSpans.reduce((sum, chapter) => sum + chapter.wordCount, 0);
    return { fixedPageCount: pages.length, chapters: chapterSpans, totalWords };
  }
}
