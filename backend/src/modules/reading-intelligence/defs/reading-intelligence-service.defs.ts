export type StartReadingIntelligenceSessionServiceInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly spineIndex?: number | null;
  readonly scrollOffset?: number | null;
  readonly spreadIndex?: number | null;
  readonly pageNumber?: number | null;
};

export type IngestReadingActivityServiceInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly sessionId: number;
  readonly activeDurationMs: number;
  readonly idleDurationMs: number;
  readonly spineIndex?: number | null;
  readonly scrollOffset?: number | null;
  readonly spreadIndex?: number | null;
  readonly pageNumber?: number | null;
};

export type EndReadingIntelligenceSessionServiceInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly sessionId: number;
  readonly activeDurationMs?: number;
  readonly idleDurationMs?: number;
  readonly spineIndex?: number | null;
  readonly scrollOffset?: number | null;
  readonly spreadIndex?: number | null;
  readonly pageNumber?: number | null;
};

export type FindCurrentReadingIntelligenceSessionServiceInput = {
  readonly userId: number;
  readonly bookId: number;
};
