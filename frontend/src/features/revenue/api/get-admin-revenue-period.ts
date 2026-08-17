import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Loads one revenue period.
 */
export async function getAdminRevenuePeriod(
  revenuePeriodId: number,
): Promise<components['schemas']['RevenuePeriodResponse']> {
  return requestJson<components['schemas']['RevenuePeriodResponse']>({
    path: `/admin/revenue-periods/${revenuePeriodId}`,
    method: 'GET',
  });
}
