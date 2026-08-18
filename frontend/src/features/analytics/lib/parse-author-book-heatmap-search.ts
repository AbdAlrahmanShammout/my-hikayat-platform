import { parsePositiveInt } from '@/lib/parse-positive-int';

export type AuthorBookHeatmapSearch = {
  readonly revenuePeriodId: number | undefined;
};

/**
 * Reads the required revenuePeriodId query for GET /author/analytics/books/:bookId/heatmap.
 */
export function parseAuthorBookHeatmapSearch(
  searchParams: URLSearchParams,
): AuthorBookHeatmapSearch {
  return {
    revenuePeriodId: parsePositiveInt(searchParams.get('revenuePeriodId') ?? undefined) ?? undefined,
  };
}
