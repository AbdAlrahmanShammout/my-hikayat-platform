import { BaseEntity } from '@/common/base/base.entity';
import { BookChapterZodType } from '@/modules/book-processing/zod/book-chapter.zod';

export class BookChapterEntity extends BaseEntity {
  bookId!: number;
  spineIndex!: number;
  href!: string;
  manifestId!: string;
  title!: string;
  contentText!: string;

  constructor(data: BookChapterZodType) {
    super();
    Object.assign(this, data);
  }
}
