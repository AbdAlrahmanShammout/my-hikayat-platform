export type CreateRevenuePeriodServiceInput = {
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly platformCutPercent?: number;
  readonly poolAmountCents?: number | null;
};

export type UpdateRevenuePeriodServiceInput = {
  readonly id: number;
  readonly platformCutPercent?: number;
  readonly poolAmountCents?: number | null;
};

export type ListRevenuePeriodsServiceInput = {
  readonly limit?: number;
  readonly offset?: number;
};
