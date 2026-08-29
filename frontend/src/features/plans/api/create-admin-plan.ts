import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Registers a catalog plan. Paid plans require a Stripe recurring price id.
 */
export async function createAdminPlan(
  body: components['schemas']['CreatePlanRequestDto'],
): Promise<components['schemas']['PlanResponse']> {
  return requestJson<components['schemas']['PlanResponse']>({
    path: '/admin/plans',
    method: 'POST',
    body,
  });
}
