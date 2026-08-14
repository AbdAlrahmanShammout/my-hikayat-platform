export type CreateBookSourceMetadataRepoInput = {
  readonly bookId: number;
  readonly packagePath: string;
  readonly epubVersion: string;
  readonly identifier: string;
  readonly title: string;
  readonly language: string;
  readonly creator: string | null;
  readonly publisher: string | null;
  readonly description: string | null;
};

export type UpdateBookSourceMetadataRepoInput = {
  readonly id: number;
  readonly packagePath: string;
  readonly epubVersion: string;
  readonly identifier: string;
  readonly title: string;
  readonly language: string;
  readonly creator: string | null;
  readonly publisher: string | null;
  readonly description: string | null;
};
