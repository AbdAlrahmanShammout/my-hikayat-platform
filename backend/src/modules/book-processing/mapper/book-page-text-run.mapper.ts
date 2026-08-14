import { BookPageTextRunEntity } from '@/modules/book-processing/entity/book-page-text-run.entity';
import { BookPageTextRunType } from '@/modules/book-processing/types/book-page-text-run-details-schema.type';

export class BookPageTextRunMapper {
  static toEntity(schema: BookPageTextRunType): BookPageTextRunEntity {
    return new BookPageTextRunEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      textLayerId: schema.textLayerId,
      sortOrder: schema.sortOrder,
      text: schema.text,
      x: Number(schema.x),
      y: Number(schema.y),
      width: schema.width == null ? null : Number(schema.width),
      height: schema.height == null ? null : Number(schema.height),
    });
  }
}
