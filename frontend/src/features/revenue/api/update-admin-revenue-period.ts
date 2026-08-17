import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

export type UpdateAdminRevenuePeriodInput = {
  readonly revenuePeriodId: number;
  readonly body: components['schemas']['UpdateRevenuePeriodRequestDto'];
};

/**
 * Updates pool cents and, when the period is open, platform cut percent.
 */
export async function updateAdminRevenuePeriod(
  input: UpdateAdminRevenuePeriodInput,
): Promise<components['schemas']['RevenuePeriodResponse']> {
  return requestJson<components['schemas']['RevenuePeriodResponse']>({
    path: `/admin/revenue-periods/${input.revenuePeriodId}`,
    method: 'PATCH',
    body: input.body,
  });
}
