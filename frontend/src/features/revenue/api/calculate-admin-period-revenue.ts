import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Calculates book shares from completed reads and the Stripe net for the period.
 */
export async function calculateAdminPeriodRevenue(
  revenuePeriodId: number,
): Promise<components['schemas']['GetAdminPeriodEarningsResponseDto']> {
  return requestJson<components['schemas']['GetAdminPeriodEarningsResponseDto']>({
    path: `/admin/revenue-periods/${revenuePeriodId}/calculate`,
    method: 'POST',
  });
}
