import { BookSpreadEntity } from '@/modules/book-processing/entity/book-spread.entity';
import { BookSpreadType } from '@/modules/book-processing/types/book-spread-details-schema.type';

export class BookSpreadMapper {
  static toEntity(schema: BookSpreadType): BookSpreadEntity {
    return new BookSpreadEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      bookId: schema.bookId,
      spreadIndex: schema.spreadIndex,
      leftPageId: schema.leftPageId,
      rightPageId: schema.rightPageId,
      centerPageId: schema.centerPageId,
    });
  }
}
