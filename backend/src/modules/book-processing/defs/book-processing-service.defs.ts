export type ExtractedEpubMetadata = {
  readonly packagePath: string;
  readonly epubVersion: string;
  readonly identifier: string;
  readonly title: string;
  readonly language: string;
  readonly creator: string | null;
  readonly publisher: string | null;
  readonly description: string | null;
};

export type ExtractedEpubChapter = {
  readonly spineIndex: number;
  readonly href: string;
  readonly manifestId: string;
  readonly title: string;
  readonly contentText: string;
};
