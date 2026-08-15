import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';
import { ReadingProgressType } from '@/modules/reading/types/reading-progress-details-schema.type';

export class ReadingProgressMapper {
  static toEntity(schema: ReadingProgressType): ReadingProgressEntity {
    return new ReadingProgressEntity({
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
      lastSessionAt: schema.lastSessionAt,
    });
  }
}
