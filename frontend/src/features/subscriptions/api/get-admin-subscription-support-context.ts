import { requestJson } from '@/api/request-json';

export type SubscriptionSupportContext = {
  readonly computedAt: string;
  readonly subscriptionId: number;
  readonly userId: number;
  readonly startedAt: string;
  readonly activatedAt: string | null;
  readonly status: string;
  readonly plan: {
    readonly id: number;
    readonly name: string;
    readonly kind: string;
    readonly interval: string | null;
    readonly amountCents: number | null;
    readonly currency: string | null;
  } | null;
  readonly currentPeriodStart: string | null;
  readonly currentPeriodEnd: string | null;
  readonly canceledAt: string | null;
  readonly trialStartedAt: string | null;
  readonly trialEndsAt: string | null;
  readonly readingAccessState: string;
  readonly trialEligible: boolean;
  readonly accessExplanationCode: 'paid_until_period_end' | 'trial_until' | 'free';
  readonly refundEligible: boolean;
  readonly refundIneligibilityCode: string | null;
  readonly stripeCustomerId: string | null;
  readonly stripeSubscriptionId: string | null;
  readonly latestPaymentFailure: {
    readonly createdAt: string;
    readonly invoiceStatus: string | null;
  } | null;
};

/**
 * Loads support context, including Stripe ids, for one subscription.
 */
export async function getAdminSubscriptionSupportContext(
  subscriptionId: number,
): Promise<SubscriptionSupportContext> {
  return requestJson<SubscriptionSupportContext>({
    path: `/admin/subscriptions/${subscriptionId}/support-context`,
    method: 'GET',
  });
}
