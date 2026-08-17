import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Opens the current UTC month if missing. Also closes elapsed open periods.
 */
export async function ensureCurrentAdminRevenuePeriod(): Promise<
  components['schemas']['RevenuePeriodResponse']
> {
  return requestJson<components['schemas']['RevenuePeriodResponse']>({
    path: '/admin/revenue-periods/current',
    method: 'POST',
  });
}
