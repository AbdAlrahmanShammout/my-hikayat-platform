import type { components } from '@/generated/admin';

/**
 * Plan name when included; otherwise the plan id.
 */
export function formatSubscriptionPlanLabel(
  subscription: components['schemas']['SubscriptionResponse'],
): string {
  if (subscription.plan?.name !== undefined && subscription.plan.name !== '') {
    return subscription.plan.name;
  }
  return `Plan #${subscription.planId}`;
}
