import { BaseEntity } from '@/common/base/base.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingCompletionStatus } from '@/modules/reading-completion/enum/general.enum';
import { BookReadingCycleZodType } from '@/modules/reading-completion/zod/book-reading-cycle.zod';

export class BookReadingCycleEntity extends BaseEntity {
  userId!: number;
  bookId!: number;
  cycleNumber!: number;
  status!: ReadingCompletionStatus;
  layoutType!: BookLayoutType;
  lastPageRead!: number | null;
  activeTimeMs!: number;
  qualifyingPageCount!: number;
  lastPageReached!: boolean;
  completedAt!: Date | null;
  pages?: { pageIndex: number; activeDurationMs: number }[];

  constructor(data: BookReadingCycleZodType) {
    super();
    Object.assign(this, data);
  }
}
