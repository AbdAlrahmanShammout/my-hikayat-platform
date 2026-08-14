import { BaseEntity } from '@/common/base/base.entity';
import { BookPageSpreadRole } from '@/modules/book-processing/enum/general.enum';
import { BookPageZodType } from '@/modules/book-processing/zod/book-page.zod';

export class BookPageEntity extends BaseEntity {
  bookId!: number;
  spineIndex!: number;
  href!: string;
  manifestId!: string;
  title!: string;
  width!: number;
  height!: number;
  spreadRole!: BookPageSpreadRole;

  constructor(data: BookPageZodType) {
    super();
    Object.assign(this, data);
  }
}
