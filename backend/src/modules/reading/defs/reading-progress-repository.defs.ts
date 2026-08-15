import { BookLayoutType } from '@/modules/book/enum/general.enum';

export type CreateReadingProgressRepoInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly layoutType: BookLayoutType;
  readonly spineIndex: number | null;
  readonly scrollOffset: number | null;
  readonly spreadIndex: number | null;
  readonly pageNumber: number | null;
  readonly lastSessionAt: Date;
};

export type UpdateReadingProgressRepoInput = {
  readonly id: number;
  readonly layoutType?: BookLayoutType;
  readonly spineIndex?: number | null;
  readonly scrollOffset?: number | null;
  readonly spreadIndex?: number | null;
  readonly pageNumber?: number | null;
  readonly lastSessionAt?: Date;
};
