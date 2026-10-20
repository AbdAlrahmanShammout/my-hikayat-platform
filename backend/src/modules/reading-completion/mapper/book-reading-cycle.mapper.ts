import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookReadingCycleEntity } from '@/modules/reading-completion/entity/book-reading-cycle.entity';
import { ReadingCompletionStatus } from '@/modules/reading-completion/enum/general.enum';
import { BookReadingCycleType } from '@/modules/reading-completion/types/book-reading-cycle-details-schema.type';

export class BookReadingCycleMapper {
  static toEntity(schema: BookReadingCycleType): BookReadingCycleEntity {
    return new BookReadingCycleEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      userId: schema.userId,
      bookId: schema.bookId,
      cycleNumber: schema.cycleNumber,
      status: schema.status as ReadingCompletionStatus,
      layoutType: schema.layoutType as BookLayoutType,
      lastPageRead: schema.lastPageRead,
      activeTimeMs: schema.activeTimeMs,
      qualifyingPageCount: schema.qualifyingPageCount,
      lastPageReached: schema.lastPageReached,
      completedAt: schema.completedAt,
      pages:
        schema.pages === undefined
          ? undefined
          : schema.pages.map((page) => ({
              pageIndex: page.pageIndex,
              activeDurationMs: page.activeDurationMs,
            })),
    });
  }
}
