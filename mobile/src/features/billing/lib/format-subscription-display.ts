import type { ReaderSubscription } from '@/features/billing/api/get-reader-subscription';
import { formatTrialRemainingLabel } from '@/features/billing/lib/format-trial-remaining-label';

export type SubscriptionDisplay = {
  readonly planLabel: string;
  readonly statusLabel: string;
  readonly accessLabel: string;
  readonly periodLabel: string | null;
  readonly trialRemainingLabel: string | null;
  readonly cancelAccessNote: string | null;
  readonly canOfferTrialAction: boolean;
  readonly canOfferRefundAction: boolean;
  readonly canOfferCancelAction: boolean;
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
  const isCanceled: boolean = subscription.status === 'canceled';
  const statusLabel: string = isCanceled ? 'Canceled' : 'Active';
  const accessLabel: string = resolveAccessLabel(subscription.readingAccessState);
  const periodEnd: string | null = coerceIsoDate(subscription.currentPeriodEnd);
  const periodLabel: string | null =
    periodEnd === null ? null : `Paid access through ${formatDisplayDate(periodEnd)}`;
  const trialRemainingLabel: string | null =
    subscription.readingAccessState === 'trial'
      ? formatTrialRemainingLabel(subscription.trialEndsAt, now)
      : null;
  const cancelAccessNote: string | null = resolveCancelAccessNote({
    isCanceled,
    readingAccessState: subscription.readingAccessState,
    periodLabel,
  });
  return {
    planLabel,
    statusLabel,
    accessLabel,
    periodLabel,
    trialRemainingLabel,
    cancelAccessNote,
    canOfferTrialAction: subscription.trialEligible === true,
    canOfferRefundAction: planKind === 'monthly_paid' && !isCanceled,
    canOfferCancelAction: planKind === 'monthly_paid' && !isCanceled,
  };
}

function resolveCancelAccessNote(input: {
  readonly isCanceled: boolean;
  readonly readingAccessState: ReaderSubscription['readingAccessState'];
  readonly periodLabel: string | null;
}): string | null {
  if (!input.isCanceled) {
    return null;
  }
  if (input.readingAccessState === 'paid' && input.periodLabel !== null) {
    return `Canceled. You can keep reading until the paid period ends. ${input.periodLabel}.`;
  }
  return 'Canceled. Paid access has ended.';
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
