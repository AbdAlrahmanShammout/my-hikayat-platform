import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingBookmarkEntity } from '@/modules/reading/entity/reading-bookmark.entity';
import { ReadingBookmarkType } from '@/modules/reading/types/reading-bookmark-details-schema.type';

export class ReadingBookmarkMapper {
  static toEntity(schema: ReadingBookmarkType): ReadingBookmarkEntity {
    return new ReadingBookmarkEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      userId: schema.userId,
      bookId: schema.bookId,
      layoutType: schema.layoutType as BookLayoutType,
      spineIndex: schema.spineIndex,
      scrollOffset: schema.scrollOffset,
      spreadIndex: schema.spreadIndex,
      pageNumber: schema.pageNumber,
    });
  }
}
