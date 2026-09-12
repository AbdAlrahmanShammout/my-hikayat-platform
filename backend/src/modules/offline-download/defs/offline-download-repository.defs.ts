export type FindOfflineDownloadRepoInput = {
  readonly userId: number;
  readonly bookId: number;
};

export type CreateOfflineDownloadRepoInput = {
  readonly userId: number;
  readonly bookId: number;
};

export type RestoreOfflineDownloadRepoInput = {
  readonly id: number;
};
