import { BaseEntity } from '@/common/base/base.entity';
import { BookLayoutType, BookPublishingStatus, BookType } from '@/modules/book/enum/general.enum';
import { BookZodType } from '@/modules/book/zod/book.zod';
import { CategoryEntity } from '@/modules/category/entity/category.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';

export class BookEntity extends BaseEntity {
  title!: string;
  description!: string;
  layoutType!: BookLayoutType | null;
  bookType!: BookType;
  publishingStatus!: BookPublishingStatus;
  publishedAt!: Date | null;
  ownerId!: number;
  owner?: UserEntity;
  categories?: CategoryEntity[];

  constructor(data: BookZodType) {
    super();
    Object.assign(this, data);
  }
}
