import { BaseEntity } from '@/common/base/base.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookZodType } from '@/modules/book/zod/book.zod';
import { CategoryEntity } from '@/modules/category/entity/category.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';

export class BookEntity extends BaseEntity {
  title!: string;
  description!: string;
  layoutType!: BookLayoutType | null;
  bookType!: BookType;
  publishingStatus!: BookPublishingStatus;
  processingStatus!: BookProcessingStatus;
  publishedAt!: Date | null;
  ownerId!: number;
  owner?: UserEntity;
  categories?: CategoryEntity[];
  /** EPUB source creator; catalog display name for the author. */
  authorName?: string | null;
  /** EPUB source publisher; catalog display name for the publisher. */
  publisherName?: string | null;

  constructor(data: BookZodType) {
    super();
    Object.assign(this, data);
  }
}
