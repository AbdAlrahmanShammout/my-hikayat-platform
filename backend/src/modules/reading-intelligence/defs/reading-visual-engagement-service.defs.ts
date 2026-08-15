export type RecordReadingVisualEngagementServiceInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly sessionId: number;
  readonly spreadIndex: number;
  readonly pageNumber: number;
  readonly activeDurationMs: number;
  readonly visualSceneTimeMs: number;
};

export type ListReadingVisualEngagementsServiceInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly sessionId: number;
  readonly limit?: number;
  readonly offset?: number;
};

export type SumReadingVisualEngagementDurationsServiceInput = {
  readonly startsAt: Date;
  readonly endsAt: Date;
};

export type SumSpreadVisualEngagementServiceInput = {
  readonly bookId: number;
  readonly startsAt: Date;
  readonly endsAt: Date;
};
