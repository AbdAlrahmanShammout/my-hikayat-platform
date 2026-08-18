export type AuthorAnalyticsPeriodOption = {
  readonly revenuePeriodId: number;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly status: string;
};

type TrendPoint = {
  readonly revenuePeriodId: number;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly status: string;
};

/**
 * Drops authorCents so the analytics period picker does not display earnings.
 */
export function toAuthorAnalyticsPeriodOptions(
  points: ReadonlyArray<TrendPoint>,
): AuthorAnalyticsPeriodOption[] {
  return points.map((point) => ({
    revenuePeriodId: point.revenuePeriodId,
    startsAt: point.startsAt,
    endsAt: point.endsAt,
    status: point.status,
  }));
}
