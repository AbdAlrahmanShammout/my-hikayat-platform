import { BookLayoutType } from '@/modules/book/enum/general.enum';

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

export type IngestReadingVisualEngagementServiceInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly sessionId: number;
  readonly spreadIndex: number;
  readonly pageNumber: number;
  readonly activeDurationMs: number;
  readonly visualSceneTimeMs: number;
};

export type ListReadingIntelligenceVisualEngagementsServiceInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly sessionId: number;
  readonly limit?: number;
  readonly offset?: number;
};

export type ListBookEngagementSignalsServiceInput = {
  readonly startsAt: Date;
  readonly endsAt: Date;
};

export type ListSpreadEngagementTotalsServiceInput = {
  readonly bookId: number;
  readonly startsAt: Date;
  readonly endsAt: Date;
};

export type BookEngagementSignal = {
  readonly bookId: number;
  readonly layoutType: BookLayoutType;
  readonly activeDurationMs: number;
  readonly visualSceneTimeMs: number;
};
