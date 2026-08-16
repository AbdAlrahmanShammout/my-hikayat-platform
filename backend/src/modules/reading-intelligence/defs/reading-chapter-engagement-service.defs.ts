export type RecordReadingChapterEngagementServiceInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly sessionId: number;
  readonly spineIndex: number;
  readonly activeDurationMs: number;
};

export type ListReadingChapterEngagementsServiceInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly sessionId: number;
  readonly limit?: number;
  readonly offset?: number;
};

export type SumReadingChapterEngagementDurationsServiceInput = {
  readonly startsAt: Date;
  readonly endsAt: Date;
};

export type SumChapterEngagementServiceInput = {
  readonly bookId: number;
  readonly startsAt: Date;
  readonly endsAt: Date;
};
