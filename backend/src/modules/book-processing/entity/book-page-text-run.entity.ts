import { BaseEntity } from '@/common/base/base.entity';
import { BookPageTextRunZodType } from '@/modules/book-processing/zod/book-page-text-run.zod';

export class BookPageTextRunEntity extends BaseEntity {
  textLayerId!: number;
  sortOrder!: number;
  text!: string;
  x!: number;
  y!: number;
  width!: number | null;
  height!: number | null;

  constructor(data: BookPageTextRunZodType) {
    super();
    Object.assign(this, data);
  }
}
