import type { ReaderSubscription } from '@/features/billing/api/get-reader-subscription';
import { formatTrialRemainingLabel } from '@/features/billing/lib/format-trial-remaining-label';
import { resolveTrialRemainingRing } from '@/features/billing/lib/resolve-trial-remaining-ring';
import {
  resolveSubscriptionExpiryPresentation,
} from '@/features/billing/lib/resolve-subscription-expiry-presentation';

export type HomeTrialDiscovery =
  | {
      readonly kind: 'offer';
      readonly title: string;
      readonly body: string;
      readonly actionLabel: string;
    }
  | {
      readonly kind: 'active';
      readonly title: string;
      readonly body: string;
      readonly remainingLabel: string | null;
      readonly remainingDayCount: number | null;
      readonly remainingProgress: number | null;
      readonly actionLabel: string;
    }
  | { readonly kind: 'hidden' };

/**
 * Decides Home trial discovery content from backend subscription fields only.
 * Never starts a trial and never invents eligibility.
 * Near-expiry / ended messaging is owned by SubscriptionExpiryBanner (MG-14).
 */
export function resolveHomeTrialDiscovery(
  subscription: ReaderSubscription | undefined,
  now: Date = new Date(),
): HomeTrialDiscovery {
  if (subscription === undefined) {
    return { kind: 'hidden' };
  }
  const expiry = resolveSubscriptionExpiryPresentation(subscription, now);
  if (expiry.kind === 'trial_approaching' || expiry.kind === 'trial_ended') {
    return { kind: 'hidden' };
  }
  if (subscription.readingAccessState === 'trial') {
    const ring = resolveTrialRemainingRing({
      trialStartedAt: subscription.trialStartedAt,
      trialEndsAt: subscription.trialEndsAt,
      now,
    });
    return {
      kind: 'active',
      title: 'Free trial active',
      body: 'Full books are open while the trial lasts.',
      remainingLabel: formatTrialRemainingLabel(subscription.trialEndsAt, now),
      remainingDayCount: ring?.dayCount ?? null,
      remainingProgress: ring?.progress ?? null,
      actionLabel: 'Subscribe',
    };
  }
  if (subscription.trialEligible === true) {
    return {
      kind: 'offer',
      title: 'Start your free trial',
      body: '7 days free · No credit card needed',
      actionLabel: 'Try free',
    };
  }
  return { kind: 'hidden' };
}
