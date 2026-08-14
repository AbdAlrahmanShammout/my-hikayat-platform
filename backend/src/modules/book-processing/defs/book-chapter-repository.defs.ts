export type CreateBookChapterRepoInput = {
  readonly spineIndex: number;
  readonly href: string;
  readonly manifestId: string;
  readonly title: string;
  readonly contentText: string;
};

export type ReplaceBookChaptersRepoInput = {
  readonly bookId: number;
  readonly chapters: readonly CreateBookChapterRepoInput[];
};
