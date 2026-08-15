import { BaseEntity } from '@/common/base/base.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingBookmarkZodType } from '@/modules/reading/zod/reading-bookmark.zod';

export class ReadingBookmarkEntity extends BaseEntity {
  userId!: number;
  bookId!: number;
  layoutType!: BookLayoutType;
  spineIndex!: number | null;
  scrollOffset!: number | null;
  spreadIndex!: number | null;
  pageNumber!: number | null;

  constructor(data: ReadingBookmarkZodType) {
    super();
    Object.assign(this, data);
  }
}
