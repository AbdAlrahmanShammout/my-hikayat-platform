import { BaseEntity } from '@/common/base/base.entity';
import { BookSpreadZodType } from '@/modules/book-processing/zod/book-spread.zod';

export class BookSpreadEntity extends BaseEntity {
  bookId!: number;
  spreadIndex!: number;
  leftPageId!: number | null;
  rightPageId!: number | null;
  centerPageId!: number | null;

  constructor(data: BookSpreadZodType) {
    super();
    Object.assign(this, data);
  }
}
