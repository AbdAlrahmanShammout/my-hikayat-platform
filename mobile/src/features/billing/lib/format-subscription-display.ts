import type { ReaderSubscription } from '@/features/billing/api/get-reader-subscription';
import { formatTrialRemainingLabel } from '@/features/billing/lib/format-trial-remaining-label';

export type SubscriptionDisplay = {
  readonly planLabel: string;
  readonly statusLabel: string;
  readonly accessLabel: string;
  readonly periodLabel: string | null;
  readonly trialRemainingLabel: string | null;
  readonly canOfferTrialAction: boolean;
  readonly canOfferRefundAction: boolean;
};

/**
 * Formats backend subscription fields for kids-friendly display.
 * Does not recompute entitlement; trial and paid access stay server-authoritative.
 */
export function formatSubscriptionDisplay(
  subscription: ReaderSubscription,
  now: Date = new Date(),
): SubscriptionDisplay {
  const planKind: string | undefined = subscription.plan?.kind;
  const planName: string = subscription.plan?.name ?? 'Subscription';
  const planLabel: string =
    planKind === 'monthly_paid'
      ? `${planName} (monthly)`
      : planKind === 'free'
        ? `${planName} (free)`
        : planName;
  const statusLabel: string =
    subscription.status === 'canceled' ? 'Canceled' : 'Active';
  const accessLabel: string = resolveAccessLabel(subscription.readingAccessState);
  const periodEnd: string | null = coerceIsoDate(subscription.currentPeriodEnd);
  const periodLabel: string | null =
    periodEnd === null ? null : `Paid access through ${formatDisplayDate(periodEnd)}`;
  const trialRemainingLabel: string | null =
    subscription.readingAccessState === 'trial'
      ? formatTrialRemainingLabel(subscription.trialEndsAt, now)
      : null;
  return {
    planLabel,
    statusLabel,
    accessLabel,
    periodLabel,
    trialRemainingLabel,
    canOfferTrialAction: subscription.trialEligible === true,
    canOfferRefundAction: planKind === 'monthly_paid',
  };
}

function resolveAccessLabel(
  readingAccessState: ReaderSubscription['readingAccessState'],
): string {
  if (readingAccessState === 'trial') {
    return 'Free Trial';
  }
  if (readingAccessState === 'paid') {
    return 'Paid';
  }
  return 'Free';
}

function coerceIsoDate(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }
  const parsed: number = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return value;
}

function formatDisplayDate(iso: string): string {
  const date: Date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
