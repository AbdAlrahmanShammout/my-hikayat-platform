import { CollectionEntity } from '@/modules/collection/entity/collection.entity';
import { CollectionBookMapper } from '@/modules/collection/mapper/collection-book.mapper';
import { CollectionDetailsType } from '@/modules/collection/types/collection-details-schema.type';

export class CollectionMapper {
  static toEntity(schema: CollectionDetailsType): CollectionEntity {
    return new CollectionEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      title: schema.title,
      description: schema.description ?? null,
      accentColor: schema.accentColor ?? null,
      items: schema.items?.map((item) => CollectionBookMapper.toEntity(item)),
    });
  }
}
