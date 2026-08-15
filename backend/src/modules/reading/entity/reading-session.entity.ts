import { BaseEntity } from '@/common/base/base.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingSessionZodType } from '@/modules/reading/zod/reading-session.zod';

export class ReadingSessionEntity extends BaseEntity {
  userId!: number;
  bookId!: number;
  layoutType!: BookLayoutType;
  startedAt!: Date;
  endedAt!: Date | null;
  activeDurationMs!: number;
  idleDurationMs!: number;
  spineIndex!: number | null;
  scrollOffset!: number | null;
  spreadIndex!: number | null;
  pageNumber!: number | null;

  constructor(data: ReadingSessionZodType) {
    super();
    Object.assign(this, data);
  }
}
