import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Closes a revenue period. Already-closed periods are returned unchanged.
 */
export async function closeAdminRevenuePeriod(
  revenuePeriodId: number,
): Promise<components['schemas']['RevenuePeriodResponse']> {
  return requestJson<components['schemas']['RevenuePeriodResponse']>({
    path: `/admin/revenue-periods/${revenuePeriodId}/close`,
    method: 'POST',
  });
}
