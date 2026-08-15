import { BookEntity } from '@/modules/book/entity/book.entity';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';

export type CollectionDiscovery = {
  readonly collection: CollectionEntity;
  readonly books: BookEntity[];
};

export type CollectionDiscoveryPage = {
  readonly entities: CollectionDiscovery[];
  readonly total: number;
};
