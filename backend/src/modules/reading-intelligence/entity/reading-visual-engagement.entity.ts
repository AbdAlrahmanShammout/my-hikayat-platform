import { BaseEntity } from '@/common/base/base.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingVisualEngagementZodType } from '@/modules/reading-intelligence/zod/reading-visual-engagement.zod';

export class ReadingVisualEngagementEntity extends BaseEntity {
  userId!: number;
  bookId!: number;
  sessionId!: number;
  layoutType!: BookLayoutType;
  spreadIndex!: number;
  pageNumber!: number;
  activeDurationMs!: number;
  visualSceneTimeMs!: number;

  constructor(data: ReadingVisualEngagementZodType) {
    super();
    Object.assign(this, data);
  }
}
