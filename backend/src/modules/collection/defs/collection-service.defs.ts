export type CreateCollectionServiceInput = {
  readonly title: string;
  readonly bookIds?: readonly number[];
  readonly actorUserId: number;
};

export type UpdateCollectionServiceInput = {
  readonly id: number;
  readonly title?: string;
  readonly actorUserId: number;
};

export type DeleteCollectionServiceInput = {
  readonly id: number;
  readonly actorUserId: number;
};

export type ListCollectionsServiceInput = {
  readonly limit?: number;
  readonly offset?: number;
};

export type AddCollectionBookServiceInput = {
  readonly collectionId: number;
  readonly bookId: number;
  readonly actorUserId: number;
};

export type RemoveCollectionBookServiceInput = {
  readonly collectionId: number;
  readonly bookId: number;
  readonly actorUserId: number;
};

export type ReorderCollectionBooksServiceInput = {
  readonly collectionId: number;
  readonly bookIds: readonly number[];
  readonly actorUserId: number;
};
