import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookDetailsType } from '@/modules/book/types/book-details-schema.type';
import { CategoryMapper } from '@/modules/category/mapper/category.mapper';
import { UserMapper } from '@/modules/user/mapper/user.mapper';

export class BookMapper {
  static toEntity(schema: BookDetailsType): BookEntity {
    return new BookEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      title: schema.title,
      description: schema.description,
      layoutType: (schema.layoutType as BookLayoutType | null) ?? null,
      bookType: schema.bookType as BookType,
      publishingStatus: schema.publishingStatus as BookPublishingStatus,
      processingStatus: schema.processingStatus as BookProcessingStatus,
      publishedAt: schema.publishedAt,
      ownerId: schema.ownerId,
      owner: schema.owner === undefined ? undefined : UserMapper.toEntity(schema.owner),
      categories: schema.categories?.map((category) => CategoryMapper.toEntity(category)),
    });
  }
}
