import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';
import { parsePositiveInt } from '@/lib/parse-positive-int';

export type AuthorEarningsSearch = {
  readonly revenuePeriodId: number | undefined;
  readonly offset: number;
  readonly trendOffset: number;
};

/**
 * Reads period selection and paging for earnings and trend from the URL.
 */
export function parseAuthorEarningsSearch(searchParams: URLSearchParams): AuthorEarningsSearch {
  return {
    revenuePeriodId: parsePositiveInt(searchParams.get('revenuePeriodId') ?? undefined) ?? undefined,
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
    trendOffset: parseNonNegativeInt(searchParams.get('trendOffset') ?? undefined) ?? 0,
  };
}
