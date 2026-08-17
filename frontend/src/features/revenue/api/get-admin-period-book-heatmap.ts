import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

export type GetAdminPeriodBookHeatmapInput = {
  readonly revenuePeriodId: number;
  readonly bookId: number;
};

/**
 * Loads the layout-aware heatmap for a book in a revenue period.
 */
export async function getAdminPeriodBookHeatmap(
  input: GetAdminPeriodBookHeatmapInput,
): Promise<components['schemas']['GetAdminPeriodBookHeatmapResponseDto']> {
  return requestJson<components['schemas']['GetAdminPeriodBookHeatmapResponseDto']>({
    path: `/admin/revenue-periods/${input.revenuePeriodId}/books/${input.bookId}/heatmap`,
    method: 'GET',
  });
}
