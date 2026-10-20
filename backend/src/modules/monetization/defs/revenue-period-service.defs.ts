export type CreateRevenuePeriodServiceInput = {
  readonly startsAt: Date;
  readonly endsAt: Date;
};

export type UpdateRevenuePeriodServiceInput = {
  readonly id: number;
  readonly poolAmountCents?: number | null;
};

export type ListRevenuePeriodsServiceInput = {
  readonly limit?: number;
  readonly offset?: number;
};
