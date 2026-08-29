import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';

export function hasTrialReadingEntitlement(
  subscription: SubscriptionEntity | null,
  now: Date = new Date(),
): boolean {
  if (subscription === null) {
    return false;
  }
  if (subscription.trialStartedAt === null || subscription.trialEndsAt === null) {
    return false;
  }
  return now.getTime() < subscription.trialEndsAt.getTime();
}
