export type StartReadingSessionServiceInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly spineIndex?: number | null;
  readonly scrollOffset?: number | null;
  readonly spreadIndex?: number | null;
  readonly pageNumber?: number | null;
  readonly startedAt?: Date;
};

export type EndReadingSessionServiceInput = {
  readonly id: number;
  readonly userId: number;
  readonly bookId: number;
  readonly endedAt?: Date;
  readonly activeDurationMs?: number;
  readonly idleDurationMs?: number;
  readonly spineIndex?: number | null;
  readonly scrollOffset?: number | null;
  readonly spreadIndex?: number | null;
  readonly pageNumber?: number | null;
};

export type RecordReadingSessionActivityServiceInput = {
  readonly id: number;
  readonly userId: number;
  readonly bookId: number;
  readonly activeDurationMs: number;
  readonly idleDurationMs: number;
  readonly spineIndex?: number | null;
  readonly scrollOffset?: number | null;
  readonly spreadIndex?: number | null;
  readonly pageNumber?: number | null;
};

export type FindOpenReadingSessionServiceInput = {
  readonly userId: number;
  readonly bookId: number;
};

export type FindOwnedReadingSessionServiceInput = {
  readonly id: number;
  readonly userId: number;
  readonly bookId: number;
};
