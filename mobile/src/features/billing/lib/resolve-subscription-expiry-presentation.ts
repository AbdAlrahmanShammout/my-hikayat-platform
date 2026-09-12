import type { ReaderSubscription } from '@/features/billing/api/get-reader-subscription';
import { formatTrialRemainingLabel } from '@/features/billing/lib/format-trial-remaining-label';

/**
 * Remaining time at or below this threshold is shown as near-expiry.
 * Display-only UX constant; does not change entitlement.
 */
export const SUBSCRIPTION_EXPIRY_APPROACHING_THRESHOLD_MS: number =
  3 * 24 * 60 * 60 * 1000;

export type SubscriptionExpiryKind =
  | 'hidden'
  | 'trial_approaching'
  | 'paid_approaching'
  | 'trial_ended'
  | 'paid_ended';

export type SubscriptionExpiryPresentation =
  | { readonly kind: 'hidden' }
  | {
      readonly kind: 'trial_approaching' | 'paid_approaching' | 'trial_ended' | 'paid_ended';
      readonly title: string;
      readonly body: string;
      readonly detailLabel: string | null;
      readonly actionLabel: string;
    };

/**
 * Maps backend subscription fields into Home/Me expiry awareness copy.
 * Does not invent entitlement — only surfaces server readingAccessState and dates.
 */
export function resolveSubscriptionExpiryPresentation(
  subscription: ReaderSubscription | undefined,
  now: Date = new Date(),
): SubscriptionExpiryPresentation {
  if (subscription === undefined) {
    return { kind: 'hidden' };
  }
  const nowMs: number = now.getTime();
  if (subscription.readingAccessState === 'trial') {
    return resolveTrialApproaching(subscription, now, nowMs);
  }
  if (subscription.readingAccessState === 'paid') {
    return resolvePaidApproaching(subscription, nowMs);
  }
  return resolveEndedAccess(subscription, nowMs);
}

function resolveTrialApproaching(
  subscription: ReaderSubscription,
  now: Date,
  nowMs: number,
): SubscriptionExpiryPresentation {
  const endsAtMs: number | null = parseIsoMs(subscription.trialEndsAt);
  if (endsAtMs === null) {
    return { kind: 'hidden' };
  }
  const remainingMs: number = endsAtMs - nowMs;
  if (remainingMs <= 0 || remainingMs > SUBSCRIPTION_EXPIRY_APPROACHING_THRESHOLD_MS) {
    return { kind: 'hidden' };
  }
  return {
    kind: 'trial_approaching',
    title: 'Free trial ending soon',
    body: 'Ask a grown-up to subscribe on Me so full-book reading can continue after the trial.',
    detailLabel: formatTrialRemainingLabel(subscription.trialEndsAt, now),
    actionLabel: 'Subscribe',
  };
}

function resolvePaidApproaching(
  subscription: ReaderSubscription,
  nowMs: number,
): SubscriptionExpiryPresentation {
  const endsAtMs: number | null = parseIsoMs(subscription.currentPeriodEnd);
  if (endsAtMs === null) {
    return { kind: 'hidden' };
  }
  const remainingMs: number = endsAtMs - nowMs;
  if (remainingMs <= 0 || remainingMs > SUBSCRIPTION_EXPIRY_APPROACHING_THRESHOLD_MS) {
    return { kind: 'hidden' };
  }
  const dateLabel: string = formatAccessEndDate(endsAtMs);
  const isCanceled: boolean = subscription.status === 'canceled';
  return {
    kind: 'paid_approaching',
    title: isCanceled ? 'Paid access ending soon' : 'Subscription renews soon',
    body: isCanceled
      ? 'Your canceled plan still lets you read until the paid period ends. Ask a grown-up to resubscribe on Me if you want to keep going.'
      : 'Ask a grown-up to check billing on Me before paid access ends.',
    detailLabel: `Paid access through ${dateLabel}`,
    actionLabel: 'Subscribe',
  };
}

function resolveEndedAccess(
  subscription: ReaderSubscription,
  nowMs: number,
): SubscriptionExpiryPresentation {
  const trialEndsAtMs: number | null = parseIsoMs(subscription.trialEndsAt);
  if (
    trialEndsAtMs !== null &&
    trialEndsAtMs <= nowMs &&
    subscription.trialEligible === false
  ) {
    return {
      kind: 'trial_ended',
      title: 'Free trial ended',
      body: 'Full-book reading needs a subscription now. Ask a grown-up to subscribe on Me.',
      detailLabel: null,
      actionLabel: 'Subscribe',
    };
  }
  const periodEndMs: number | null = parseIsoMs(subscription.currentPeriodEnd);
  const wasPaidPlan: boolean =
    subscription.status === 'canceled' || subscription.plan?.kind === 'monthly_paid';
  if (periodEndMs !== null && periodEndMs <= nowMs && wasPaidPlan) {
    return {
      kind: 'paid_ended',
      title: 'Paid access ended',
      body: 'Full-book reading needs an active subscription. Ask a grown-up to subscribe on Me.',
      detailLabel: null,
      actionLabel: 'Subscribe',
    };
  }
  return { kind: 'hidden' };
}

function parseIsoMs(value: unknown): number | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }
  const parsed: number = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}

function formatAccessEndDate(endsAtMs: number): string {
  const date: Date = new Date(endsAtMs);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
