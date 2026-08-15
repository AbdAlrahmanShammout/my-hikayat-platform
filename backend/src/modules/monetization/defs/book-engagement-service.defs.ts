export type AggregatePeriodEngagementServiceInput = {
  readonly revenuePeriodId: number;
};

export type ListBookEngagementsServiceInput = {
  readonly revenuePeriodId: number;
  readonly ownerId?: number;
  readonly limit?: number;
  readonly offset?: number;
};

export type FindBookEngagementByPeriodAndBookServiceInput = {
  readonly revenuePeriodId: number;
  readonly bookId: number;
};

export type SummarizeOwnerEngagementServiceInput = {
  readonly revenuePeriodId: number;
  readonly ownerId?: number;
};
