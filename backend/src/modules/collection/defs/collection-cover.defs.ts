export type CollectionCover = {
  readonly url: string;
  readonly expiresAt: Date;
  readonly contentType: string;
};

export type UploadCollectionCoverServiceInput = {
  readonly collectionId: number;
  readonly actorUserId: number;
  readonly body: Buffer;
  readonly contentType: string;
  readonly originalFileName?: string | null;
};

export type ClearCollectionCoverServiceInput = {
  readonly collectionId: number;
  readonly actorUserId: number;
};
