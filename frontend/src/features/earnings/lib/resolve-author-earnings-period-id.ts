type PeriodRef = {
  readonly revenuePeriodId: number;
};

/**
 * Uses the URL period when present. Otherwise the first trend point on the current page.
 */
export function resolveAuthorEarningsPeriodId(input: {
  readonly revenuePeriodId: number | undefined;
  readonly points: ReadonlyArray<PeriodRef>;
}): number | undefined {
  if (input.revenuePeriodId !== undefined) {
    return input.revenuePeriodId;
  }
  return input.points[0]?.revenuePeriodId;
}
