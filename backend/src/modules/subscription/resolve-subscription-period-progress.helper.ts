import { SubscriptionPeriodProgress } from '@/modules/subscription/defs/subscription-period-progress.defs';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import {
  ReadingAccessState,
  resolveReadingAccessState,
} from '@/modules/subscription/resolve-reading-access-state.helper';

type BoundedPeriod = {
  readonly startedAt: Date;
  readonly endsAt: Date;
};

/**
 * Derives remaining time and elapsed percent from existing subscription period dates.
 * Does not invent entitlement; access state still comes from resolveReadingAccessState.
 */
export function resolveSubscriptionPeriodProgress(
  subscription: SubscriptionEntity | null,
  now: Date = new Date(),
): SubscriptionPeriodProgress {
  const period: BoundedPeriod | null = resolveBoundedPeriod(subscription, now);
  if (period === null) {
    return {
      periodStartedAt: null,
      periodEndsAt: null,
      remainingMs: null,
      elapsedPercent: null,
    };
  }
  return {
    periodStartedAt: period.startedAt,
    periodEndsAt: period.endsAt,
    remainingMs: Math.max(0, period.endsAt.getTime() - now.getTime()),
    elapsedPercent: resolveElapsedPercent(period, now),
  };
}

function resolveBoundedPeriod(
  subscription: SubscriptionEntity | null,
  now: Date,
): BoundedPeriod | null {
  if (subscription === null) {
    return null;
  }
  const accessState: ReadingAccessState = resolveReadingAccessState(subscription, now);
  if (accessState === ReadingAccessState.PAID) {
    return toBoundedPeriod(subscription.currentPeriodStart, subscription.currentPeriodEnd);
  }
  if (accessState === ReadingAccessState.TRIAL) {
    return toBoundedPeriod(subscription.trialStartedAt, subscription.trialEndsAt);
  }
  return resolveExpiredDisplayPeriod(subscription, now);
}

function resolveExpiredDisplayPeriod(
  subscription: SubscriptionEntity,
  now: Date,
): BoundedPeriod | null {
  const paidPeriod: BoundedPeriod | null = toBoundedPeriod(
    subscription.currentPeriodStart,
    subscription.currentPeriodEnd,
  );
  if (paidPeriod !== null && paidPeriod.endsAt.getTime() <= now.getTime()) {
    return paidPeriod;
  }
  const trialPeriod: BoundedPeriod | null = toBoundedPeriod(
    subscription.trialStartedAt,
    subscription.trialEndsAt,
  );
  if (trialPeriod !== null && trialPeriod.endsAt.getTime() <= now.getTime()) {
    return trialPeriod;
  }
  return null;
}

function toBoundedPeriod(startedAt: Date | null, endsAt: Date | null): BoundedPeriod | null {
  if (startedAt === null || endsAt === null) {
    return null;
  }
  return { startedAt, endsAt };
}

function resolveElapsedPercent(period: BoundedPeriod, now: Date): number {
  const totalMs: number = period.endsAt.getTime() - period.startedAt.getTime();
  if (totalMs <= 0) {
    return 100;
  }
  const elapsedMs: number = now.getTime() - period.startedAt.getTime();
  return clampPercent(Math.floor((elapsedMs / totalMs) * 100));
}

function clampPercent(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 100) {
    return 100;
  }
  return value;
}
