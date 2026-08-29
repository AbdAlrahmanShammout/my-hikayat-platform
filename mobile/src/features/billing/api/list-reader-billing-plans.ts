import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type ReaderBillingPlansResponse = components['schemas']['GetPlansResponseDto'];
export type ReaderBillingPlan = components['schemas']['PlanResponse'];

/**
 * Lists paid plans available for Stripe Checkout.
 */
export async function listReaderBillingPlans(): Promise<ReaderBillingPlansResponse> {
  return requestJson<ReaderBillingPlansResponse>({
    path: '/reader/billing/plans',
    method: 'GET',
  });
}
