import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/author';

/**
 * Loads owner-scoped author Home KPIs. Does not assemble list or earnings pages in the client.
 */
export async function getAuthorDashboardSummary(): Promise<
  components['schemas']['GetAuthorDashboardSummaryResponseDto']
> {
  return requestJson<components['schemas']['GetAuthorDashboardSummaryResponseDto']>({
    path: '/author/dashboard/summary',
    method: 'GET',
  });
}
