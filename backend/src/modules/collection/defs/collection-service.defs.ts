export type CreateCollectionServiceInput = {
  readonly title: string;
  readonly bookIds?: readonly number[];
};

export type UpdateCollectionServiceInput = {
  readonly id: number;
  readonly title?: string;
};

export type ListCollectionsServiceInput = {
  readonly limit?: number;
  readonly offset?: number;
};

export type AddCollectionBookServiceInput = {
  readonly collectionId: number;
  readonly bookId: number;
};

export type RemoveCollectionBookServiceInput = {
  readonly collectionId: number;
  readonly bookId: number;
};

export type ReorderCollectionBooksServiceInput = {
  readonly collectionId: number;
  readonly bookIds: readonly number[];
};
