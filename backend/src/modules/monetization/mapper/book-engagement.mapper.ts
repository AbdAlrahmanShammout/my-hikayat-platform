import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookEngagementEntity } from '@/modules/monetization/entity/book-engagement.entity';
import { BookEngagementType } from '@/modules/monetization/types/book-engagement-details-schema.type';

export class BookEngagementMapper {
  static toEntity(schema: BookEngagementType): BookEngagementEntity {
    return new BookEngagementEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      revenuePeriodId: schema.revenuePeriodId,
      bookId: schema.bookId,
      layoutType: schema.layoutType as BookLayoutType,
      activeReadingMs: schema.activeReadingMs,
      activeSpreadMs: schema.activeSpreadMs,
      visualSceneTimeMs: schema.visualSceneTimeMs,
      categoryWeight: Number(schema.categoryWeight),
      weightedEngagement: Number(schema.weightedEngagement),
    });
  }
}
