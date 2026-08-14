import { BaseEntity } from '@/common/base/base.entity';
import { BookPageTextRunEntity } from '@/modules/book-processing/entity/book-page-text-run.entity';
import { BookPageTextLayerZodType } from '@/modules/book-processing/zod/book-page-text-layer.zod';

export class BookPageTextLayerEntity extends BaseEntity {
  pageId!: number;
  bookId!: number;
  contentText!: string;
  runs?: BookPageTextRunEntity[];

  constructor(data: BookPageTextLayerZodType) {
    super();
    Object.assign(this, data);
  }
}
