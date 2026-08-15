import { BaseEntity } from '@/common/base/base.entity';
import { BookRevenueZodType } from '@/modules/monetization/zod/book-revenue.zod';

export class BookRevenueEntity extends BaseEntity {
  revenuePeriodId!: number;
  bookId!: number;
  ownerId!: number;
  weightedEngagement!: number;
  poolShareCents!: number;
  platformCutCents!: number;
  authorCents!: number;

  constructor(data: BookRevenueZodType) {
    super();
    Object.assign(this, data);
  }
}
