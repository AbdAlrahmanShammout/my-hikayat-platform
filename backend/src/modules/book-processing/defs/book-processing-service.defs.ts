import { BookPageSpreadRole } from '@/modules/book-processing/enum/general.enum';
import { UserRole } from '@/modules/user/enum/general.enum';

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

export type ExtractedEpubPage = {
  readonly spineIndex: number;
  readonly href: string;
  readonly manifestId: string;
  readonly title: string;
  readonly width: number;
  readonly height: number;
  readonly spreadRole: BookPageSpreadRole;
};

export type ExtractedEpubSpread = {
  readonly spreadIndex: number;
  readonly leftSpineIndex: number | null;
  readonly rightSpineIndex: number | null;
  readonly centerSpineIndex: number | null;
};

export type ExtractedEpubFixedLayout = {
  readonly pages: readonly ExtractedEpubPage[];
  readonly spreads: readonly ExtractedEpubSpread[];
};

export type ExtractedEpubTextRun = {
  readonly sortOrder: number;
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number | null;
  readonly height: number | null;
};

export type ExtractedEpubPageTextLayer = {
  readonly spineIndex: number;
  readonly href: string;
  readonly contentText: string;
  readonly runs: readonly ExtractedEpubTextRun[];
};

export type SubmitBookForReviewServiceInput = {
  readonly bookId: number;
  readonly actorId: number;
  readonly actorRole: UserRole;
};
