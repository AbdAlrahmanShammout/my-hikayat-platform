export type ChapterWordSpan = {
  readonly spineIndex: number;
  readonly wordCount: number;
};

export type BookReadingStructure = {
  readonly fixedPageCount: number;
  readonly chapters: readonly ChapterWordSpan[];
  readonly totalWords: number;
};
