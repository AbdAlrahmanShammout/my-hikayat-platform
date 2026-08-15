import { BookRevenueEntity } from '@/modules/monetization/entity/book-revenue.entity';
import { BookRevenueType } from '@/modules/monetization/types/book-revenue-details-schema.type';

export class BookRevenueMapper {
  static toEntity(schema: BookRevenueType): BookRevenueEntity {
    return new BookRevenueEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      revenuePeriodId: schema.revenuePeriodId,
      bookId: schema.bookId,
      ownerId: schema.ownerId,
      weightedEngagement: Number(schema.weightedEngagement),
      poolShareCents: schema.poolShareCents,
      platformCutCents: schema.platformCutCents,
      authorCents: schema.authorCents,
    });
  }
}
