import { BaseEntity } from '@/common/base/base.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingProgressZodType } from '@/modules/reading/zod/reading-progress.zod';

export class ReadingProgressEntity extends BaseEntity {
  userId!: number;
  bookId!: number;
  layoutType!: BookLayoutType;
  spineIndex!: number | null;
  scrollOffset!: number | null;
  spreadIndex!: number | null;
  pageNumber!: number | null;
  lastSessionAt!: Date;

  constructor(data: ReadingProgressZodType) {
    super();
    Object.assign(this, data);
  }
}
