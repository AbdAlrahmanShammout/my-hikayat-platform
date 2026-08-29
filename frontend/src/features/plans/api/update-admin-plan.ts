import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Updates plan display fields and optional Stripe price id.
 */
export async function updateAdminPlan(
  planId: number,
  body: components['schemas']['UpdatePlanRequestDto'],
): Promise<components['schemas']['PlanResponse']> {
  return requestJson<components['schemas']['PlanResponse']>({
    path: `/admin/plans/${planId}`,
    method: 'PATCH',
    body,
  });
}
