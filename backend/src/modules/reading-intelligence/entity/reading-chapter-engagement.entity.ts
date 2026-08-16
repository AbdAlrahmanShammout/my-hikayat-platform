import { BaseEntity } from '@/common/base/base.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingChapterEngagementZodType } from '@/modules/reading-intelligence/zod/reading-chapter-engagement.zod';

export class ReadingChapterEngagementEntity extends BaseEntity {
  userId!: number;
  bookId!: number;
  sessionId!: number;
  layoutType!: BookLayoutType;
  spineIndex!: number;
  activeDurationMs!: number;

  constructor(data: ReadingChapterEngagementZodType) {
    super();
    Object.assign(this, data);
  }
}
