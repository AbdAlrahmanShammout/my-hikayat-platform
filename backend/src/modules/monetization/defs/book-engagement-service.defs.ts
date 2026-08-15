export type AggregatePeriodEngagementServiceInput = {
  readonly revenuePeriodId: number;
};

export type ListBookEngagementsServiceInput = {
  readonly revenuePeriodId: number;
  readonly limit?: number;
  readonly offset?: number;
};

export type FindBookEngagementByPeriodAndBookServiceInput = {
  readonly revenuePeriodId: number;
  readonly bookId: number;
};
