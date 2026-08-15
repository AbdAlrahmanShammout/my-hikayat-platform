export type CalculatePeriodRevenueServiceInput = {
  readonly revenuePeriodId: number;
};

export type ListBookRevenuesServiceInput = {
  readonly revenuePeriodId: number;
  readonly ownerId?: number;
  readonly limit?: number;
  readonly offset?: number;
};

export type FindBookRevenueByPeriodAndBookServiceInput = {
  readonly revenuePeriodId: number;
  readonly bookId: number;
};

export type SumAuthorCentsServiceInput = {
  readonly revenuePeriodId: number;
  readonly ownerId: number;
};
