import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/author';
import { toSearchParams } from '@/lib/to-search-params';

export type GetAuthorBookHeatmapInput = {
  readonly bookId: number;
  readonly revenuePeriodId: number;
};

/**
 * Loads the layout-aware heatmap for an owned book in a revenue period.
 */
export async function getAuthorBookHeatmap(
  input: GetAuthorBookHeatmapInput,
): Promise<components['schemas']['GetAuthorBookHeatmapResponseDto']> {
  return requestJson<components['schemas']['GetAuthorBookHeatmapResponseDto']>({
    path: `/author/analytics/books/${input.bookId}/heatmap${toSearchParams({
      revenuePeriodId: input.revenuePeriodId,
    })}`,
    method: 'GET',
  });
}
