import { CollectionEntity } from '@/modules/collection/entity/collection.entity';

export type CollectionBookRepoInput = {
  readonly bookId: number;
  readonly displayOrder: number;
};

export type CreateCollectionRepoInput = {
  readonly title: string;
  readonly books: readonly CollectionBookRepoInput[];
};

export type UpdateCollectionRepoInput = {
  readonly id: number;
  readonly title?: string;
  readonly books?: readonly CollectionBookRepoInput[];
};

export type ListCollectionsRepoInput = {
  readonly limit: number;
  readonly offset: number;
};

export type CollectionPage = {
  readonly entities: CollectionEntity[];
  readonly total: number;
};
