import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';
import { parsePositiveInt } from '@/lib/parse-positive-int';

export type AuthorAnalyticsSearch = {
  readonly revenuePeriodId: number | undefined;
  readonly offset: number;
};

/**
 * Reads revenuePeriodId and paging for GET /author/analytics from the URL.
 */
export function parseAuthorAnalyticsSearch(searchParams: URLSearchParams): AuthorAnalyticsSearch {
  return {
    revenuePeriodId: parsePositiveInt(searchParams.get('revenuePeriodId') ?? undefined) ?? undefined,
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
  };
}
