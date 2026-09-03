import type { ReaderSubscription } from '@/features/billing/api/get-reader-subscription';
import { formatTrialRemainingLabel } from '@/features/billing/lib/format-trial-remaining-label';

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
      readonly actionLabel: string;
    }
  | { readonly kind: 'hidden' };

/**
 * Decides Home trial discovery content from backend subscription fields only.
 * Never starts a trial and never invents eligibility.
 */
export function resolveHomeTrialDiscovery(
  subscription: ReaderSubscription | undefined,
  now: Date = new Date(),
): HomeTrialDiscovery {
  if (subscription === undefined) {
    return { kind: 'hidden' };
  }
  if (subscription.readingAccessState === 'trial') {
    return {
      kind: 'active',
      title: 'You’re on a free trial',
      body: 'Full books are open while the trial lasts. Ask a grown-up to manage billing on Me.',
      remainingLabel: formatTrialRemainingLabel(subscription.trialEndsAt, now),
      actionLabel: 'View on Me',
    };
  }
  if (subscription.trialEligible === true) {
    return {
      kind: 'offer',
      title: 'Try full books free',
      body: '7 days free — no credit card. Ask a grown-up to start the free trial on Me.',
      actionLabel: 'Start Free Trial',
    };
  }
  return { kind: 'hidden' };
}
