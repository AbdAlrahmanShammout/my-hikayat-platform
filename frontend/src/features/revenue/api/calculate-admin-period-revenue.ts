import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Calculates author shares after refreshing period engagement. Requires poolAmountCents.
 */
export async function calculateAdminPeriodRevenue(
  revenuePeriodId: number,
): Promise<components['schemas']['GetAdminPeriodEarningsResponseDto']> {
  return requestJson<components['schemas']['GetAdminPeriodEarningsResponseDto']>({
    path: `/admin/revenue-periods/${revenuePeriodId}/calculate`,
    method: 'POST',
  });
}
