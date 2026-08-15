import { BaseEntity } from '@/common/base/base.entity';
import { CollectionBookZodType } from '@/modules/collection/zod/collection-book.zod';

export class CollectionBookEntity extends BaseEntity {
  collectionId!: number;
  bookId!: number;
  displayOrder!: number;

  constructor(data: CollectionBookZodType) {
    super();
    Object.assign(this, data);
  }
}
