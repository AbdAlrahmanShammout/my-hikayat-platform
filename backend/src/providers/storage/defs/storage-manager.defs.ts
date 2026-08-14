export type PutStorageObjectInput = {
  readonly key: string;
  readonly body: Buffer;
  readonly contentType: string;
};

export type PutStorageObjectResult = {
  readonly key: string;
  readonly byteSize: number;
};

export type GetStorageObjectInput = {
  readonly key: string;
};

export type GetStorageObjectResult = {
  readonly key: string;
  readonly body: Buffer;
  readonly contentType: string;
  readonly byteSize: number;
};

export type DeleteStorageObjectInput = {
  readonly key: string;
};

export type CreateStorageSignedUrlInput = {
  readonly key: string;
  readonly expiresInSeconds: number;
};

export type StorageSignedUrl = {
  readonly url: string;
  readonly expiresAt: Date;
};
