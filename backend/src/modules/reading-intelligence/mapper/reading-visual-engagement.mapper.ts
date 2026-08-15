import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingVisualEngagementEntity } from '@/modules/reading-intelligence/entity/reading-visual-engagement.entity';
import { ReadingVisualEngagementType } from '@/modules/reading-intelligence/types/reading-visual-engagement-details-schema.type';

export class ReadingVisualEngagementMapper {
  static toEntity(schema: ReadingVisualEngagementType): ReadingVisualEngagementEntity {
    return new ReadingVisualEngagementEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      userId: schema.userId,
      bookId: schema.bookId,
      sessionId: schema.sessionId,
      layoutType: schema.layoutType as BookLayoutType,
      spreadIndex: schema.spreadIndex,
      pageNumber: schema.pageNumber,
      activeDurationMs: schema.activeDurationMs,
      visualSceneTimeMs: schema.visualSceneTimeMs,
    });
  }
}
