import { BookLayoutType } from '@/modules/book/enum/general.enum';

export type CreateReadingSessionRepoInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly layoutType: BookLayoutType;
  readonly startedAt: Date;
  readonly endedAt: Date | null;
  readonly activeDurationMs: number;
  readonly idleDurationMs: number;
  readonly spineIndex: number | null;
  readonly scrollOffset: number | null;
  readonly spreadIndex: number | null;
  readonly pageNumber: number | null;
};

export type UpdateReadingSessionRepoInput = {
  readonly id: number;
  readonly endedAt?: Date | null;
  readonly activeDurationMs?: number;
  readonly idleDurationMs?: number;
  readonly spineIndex?: number | null;
  readonly scrollOffset?: number | null;
  readonly spreadIndex?: number | null;
  readonly pageNumber?: number | null;
};

export type SumReadingSessionActiveDurationRepoInput = {
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly layoutType: BookLayoutType;
};

export type BookActiveDurationTotal = {
  readonly bookId: number;
  readonly activeDurationMs: number;
};
