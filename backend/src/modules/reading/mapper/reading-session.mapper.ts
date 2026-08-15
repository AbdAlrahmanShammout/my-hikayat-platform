import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';
import { ReadingSessionType } from '@/modules/reading/types/reading-session-details-schema.type';

export class ReadingSessionMapper {
  static toEntity(schema: ReadingSessionType): ReadingSessionEntity {
    return new ReadingSessionEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      userId: schema.userId,
      bookId: schema.bookId,
      layoutType: schema.layoutType as BookLayoutType,
      startedAt: schema.startedAt,
      endedAt: schema.endedAt,
      activeDurationMs: schema.activeDurationMs,
      idleDurationMs: schema.idleDurationMs,
      spineIndex: schema.spineIndex,
      scrollOffset: schema.scrollOffset,
      spreadIndex: schema.spreadIndex,
      pageNumber: schema.pageNumber,
    });
  }
}
