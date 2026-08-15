import { BookLayoutType } from '@/modules/book/enum/general.enum';

export type SearchInBookRepoInput = {
  readonly bookId: number;
  readonly query: string;
  readonly limit: number;
  readonly offset: number;
  readonly layoutType: BookLayoutType;
};

export type SearchInBookRun = {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number | null;
  readonly height: number | null;
};

export type SearchInBookHitRecord = {
  readonly layoutType: BookLayoutType;
  readonly spineIndex: number;
  readonly pageNumber: number | null;
  readonly spreadIndex: number | null;
  readonly title: string;
  readonly contentText: string;
  readonly runs: readonly SearchInBookRun[];
};

export type SearchInBookRecordPage = {
  readonly hits: SearchInBookHitRecord[];
  readonly total: number;
};
