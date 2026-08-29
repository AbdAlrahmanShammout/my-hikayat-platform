import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { hasPaidReadingEntitlement } from '@/modules/subscription/has-paid-reading-entitlement.helper';
import { hasTrialReadingEntitlement } from '@/modules/subscription/has-trial-reading-entitlement.helper';

export function hasFullBookReadingEntitlement(
  subscription: SubscriptionEntity | null,
  now: Date = new Date(),
): boolean {
  return (
    hasPaidReadingEntitlement(subscription, now) || hasTrialReadingEntitlement(subscription, now)
  );
}
