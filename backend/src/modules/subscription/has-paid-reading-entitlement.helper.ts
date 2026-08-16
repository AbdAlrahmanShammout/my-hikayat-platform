import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { PlanKind } from '@/modules/subscription/enum/general.enum';

export function hasPaidReadingEntitlement(
  subscription: SubscriptionEntity | null,
  now: Date = new Date(),
): boolean {
  if (subscription === null || subscription.plan?.kind !== PlanKind.MONTHLY_PAID) {
    return false;
  }
  if (subscription.currentPeriodEnd === null) {
    return false;
  }
  return now.getTime() < subscription.currentPeriodEnd.getTime();
}
