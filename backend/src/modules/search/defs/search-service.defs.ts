import { BookLayoutType } from '@/modules/book/enum/general.enum';

export type SearchCatalogBooksServiceInput = {
  readonly limit?: number;
  readonly offset?: number;
  readonly title?: string;
  readonly author?: string;
  readonly publisher?: string;
};

export type SearchInBookServiceInput = {
  readonly bookId: number;
  readonly query: string;
  readonly limit?: number;
  readonly offset?: number;
};

export type InBookSearchHighlight = {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number | null;
  readonly height: number | null;
};

export type InBookSearchHit = {
  readonly layoutType: BookLayoutType;
  readonly spineIndex: number;
  readonly pageNumber: number | null;
  readonly spreadIndex: number | null;
  readonly title: string;
  readonly excerpt: string;
  readonly matchOffset: number;
  readonly highlights: readonly InBookSearchHighlight[];
};

export type InBookSearchPage = {
  readonly hits: InBookSearchHit[];
  readonly total: number;
};
