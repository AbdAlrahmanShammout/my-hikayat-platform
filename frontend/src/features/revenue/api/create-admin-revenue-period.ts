import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Creates a revenue period. The net pool is written later, when the period is calculated.
 */
export async function createAdminRevenuePeriod(
  body: components['schemas']['CreateRevenuePeriodRequestDto'],
): Promise<components['schemas']['RevenuePeriodResponse']> {
  return requestJson<components['schemas']['RevenuePeriodResponse']>({
    path: '/admin/revenue-periods',
    method: 'POST',
    body,
  });
}
