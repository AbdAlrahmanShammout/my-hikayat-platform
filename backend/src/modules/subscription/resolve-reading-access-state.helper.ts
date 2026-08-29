import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { hasPaidReadingEntitlement } from '@/modules/subscription/has-paid-reading-entitlement.helper';
import { hasTrialReadingEntitlement } from '@/modules/subscription/has-trial-reading-entitlement.helper';

export enum ReadingAccessState {
  FREE = 'free',
  TRIAL = 'trial',
  PAID = 'paid',
}

export function resolveReadingAccessState(
  subscription: SubscriptionEntity | null,
  now: Date = new Date(),
): ReadingAccessState {
  if (hasPaidReadingEntitlement(subscription, now)) {
    return ReadingAccessState.PAID;
  }
  if (hasTrialReadingEntitlement(subscription, now)) {
    return ReadingAccessState.TRIAL;
  }
  return ReadingAccessState.FREE;
}

export function isTrialEligible(
  subscription: SubscriptionEntity | null,
  now: Date = new Date(),
): boolean {
  if (subscription === null) {
    return true;
  }
  if (hasPaidReadingEntitlement(subscription, now)) {
    return false;
  }
  return subscription.trialStartedAt === null;
}
