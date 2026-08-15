import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';

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

export type ListReadingProgressesRepoInput = {
  readonly userId: number;
  readonly bookId?: number;
  readonly updatedSince?: Date;
  readonly limit?: number;
  readonly offset?: number;
};

export type ReadingProgressPage = {
  readonly entities: ReadingProgressEntity[];
  readonly total: number;
};
