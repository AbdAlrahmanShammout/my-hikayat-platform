import { BaseEntity } from '@/common/base/base.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookEngagementZodType } from '@/modules/monetization/zod/book-engagement.zod';

export class BookEngagementEntity extends BaseEntity {
  revenuePeriodId!: number;
  bookId!: number;
  layoutType!: BookLayoutType;
  activeReadingMs!: number;
  activeSpreadMs!: number;
  visualSceneTimeMs!: number;
  categoryWeight!: number;
  weightedEngagement!: number;

  constructor(data: BookEngagementZodType) {
    super();
    Object.assign(this, data);
  }
}
