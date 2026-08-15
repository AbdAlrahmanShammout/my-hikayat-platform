import { CollectionBookEntity } from '@/modules/collection/entity/collection-book.entity';
import { CollectionBookType } from '@/modules/collection/types/collection-book-details-schema.type';

export class CollectionBookMapper {
  static toEntity(schema: CollectionBookType): CollectionBookEntity {
    return new CollectionBookEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      collectionId: schema.collectionId,
      bookId: schema.bookId,
      displayOrder: schema.displayOrder,
    });
  }
}
