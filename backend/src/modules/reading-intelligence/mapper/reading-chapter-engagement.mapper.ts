import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingChapterEngagementEntity } from '@/modules/reading-intelligence/entity/reading-chapter-engagement.entity';
import { ReadingChapterEngagementType } from '@/modules/reading-intelligence/types/reading-chapter-engagement-details-schema.type';

export class ReadingChapterEngagementMapper {
  static toEntity(schema: ReadingChapterEngagementType): ReadingChapterEngagementEntity {
    return new ReadingChapterEngagementEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      userId: schema.userId,
      bookId: schema.bookId,
      sessionId: schema.sessionId,
      layoutType: schema.layoutType as BookLayoutType,
      spineIndex: schema.spineIndex,
      activeDurationMs: schema.activeDurationMs,
    });
  }
}
