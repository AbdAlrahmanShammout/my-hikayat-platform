import { TransactionContext } from '@/common/base/transaction-context';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookReadingCycleEntity } from '@/modules/reading-completion/entity/book-reading-cycle.entity';
import { ReadingCompletionStatus } from '@/modules/reading-completion/enum/general.enum';

export type CreateBookReadingCycleRepoInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly cycleNumber: number;
  readonly layoutType: BookLayoutType;
};

export type UpdateBookReadingCycleRepoInput = {
  readonly id: number;
  readonly status: ReadingCompletionStatus;
  readonly lastPageRead: number | null;
  readonly activeTimeMs: number;
  readonly qualifyingPageCount: number;
  readonly lastPageReached: boolean;
  readonly completedAt: Date | null;
};

export type AddPageDwellRepoInput = {
  readonly cycleId: number;
  readonly pageIndex: number;
  readonly activeDurationMs: number;
};

export type CompletedReadCountRow = {
  readonly bookId: number;
  readonly completedReadCount: number;
};

export abstract class BookReadingCycleRepository {
  abstract findLatest(
    userId: number,
    bookId: number,
    context?: TransactionContext,
  ): Promise<BookReadingCycleEntity | null>;
  abstract listLatestForBooks(
    userId: number,
    bookIds: readonly number[],
  ): Promise<BookReadingCycleEntity[]>;
  abstract create(
    input: CreateBookReadingCycleRepoInput,
    context?: TransactionContext,
  ): Promise<BookReadingCycleEntity>;
  abstract addPageDwell(
    input: AddPageDwellRepoInput,
    context?: TransactionContext,
  ): Promise<void>;
  abstract update(
    input: UpdateBookReadingCycleRepoInput,
    context?: TransactionContext,
  ): Promise<BookReadingCycleEntity>;
  abstract listCompletedReadCounts(input: {
    readonly startsAt: Date;
    readonly endsAt: Date;
  }): Promise<CompletedReadCountRow[]>;
}
