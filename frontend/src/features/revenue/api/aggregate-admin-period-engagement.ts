import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Refreshes weighted book engagement. This is not a calculate-audit event.
 */
export async function aggregateAdminPeriodEngagement(
  revenuePeriodId: number,
): Promise<components['schemas']['GetAdminPeriodAnalyticsResponseDto']> {
  return requestJson<components['schemas']['GetAdminPeriodAnalyticsResponseDto']>({
    path: `/admin/revenue-periods/${revenuePeriodId}/engagements`,
    method: 'POST',
  });
}
