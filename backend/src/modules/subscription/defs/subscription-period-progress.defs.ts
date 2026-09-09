export type SubscriptionPeriodProgress = {
  readonly periodStartedAt: Date | null;
  readonly periodEndsAt: Date | null;
  readonly remainingMs: number | null;
  readonly elapsedPercent: number | null;
};
