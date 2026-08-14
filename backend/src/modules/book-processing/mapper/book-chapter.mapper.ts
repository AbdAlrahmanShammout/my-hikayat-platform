import { BookChapterEntity } from '@/modules/book-processing/entity/book-chapter.entity';
import { BookChapterType } from '@/modules/book-processing/types/book-chapter-details-schema.type';

export class BookChapterMapper {
  static toEntity(schema: BookChapterType): BookChapterEntity {
    return new BookChapterEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      bookId: schema.bookId,
      spineIndex: schema.spineIndex,
      href: schema.href,
      manifestId: schema.manifestId,
      title: schema.title,
      contentText: schema.contentText,
    });
  }
}
