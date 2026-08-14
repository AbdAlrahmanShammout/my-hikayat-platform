export type CreateBookPageTextRunRepoInput = {
  readonly sortOrder: number;
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number | null;
  readonly height: number | null;
};

export type CreateBookPageTextLayerRepoInput = {
  readonly pageId: number;
  readonly contentText: string;
  readonly runs: readonly CreateBookPageTextRunRepoInput[];
};

export type ReplaceBookPageTextLayersRepoInput = {
  readonly bookId: number;
  readonly layers: readonly CreateBookPageTextLayerRepoInput[];
};
