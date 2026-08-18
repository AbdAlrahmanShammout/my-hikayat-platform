import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Loads platform-wide admin Home KPIs. Does not assemble list totals in the client.
 */
export async function getAdminDashboardSummary(): Promise<
  components['schemas']['GetAdminDashboardSummaryResponseDto']
> {
  return requestJson<components['schemas']['GetAdminDashboardSummaryResponseDto']>({
    path: '/admin/dashboard/summary',
    method: 'GET',
  });
}
