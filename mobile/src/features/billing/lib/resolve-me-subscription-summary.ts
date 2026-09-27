import type { SubscriptionDisplay } from '@/features/billing/lib/format-subscription-display';

export type MeSubscriptionAction = 'see_plans' | 'manage' | 'start_trial';

export type MeSubscriptionSummary = {
  readonly title: string;
  readonly detail: string;
  readonly note: string | null;
  readonly action: MeSubscriptionAction;
  readonly actionLabel: string;
};

const FREE_DETAIL = 'Full books need a plan.';

/**
 * Me card copy from backend subscription display. Does not decide entitlement.
 */
export function resolveMeSubscriptionSummary(input: {
  readonly display: SubscriptionDisplay;
  readonly planName: string;
}): MeSubscriptionSummary {
  if (input.display.trialRemainingLabel !== null) {
    return {
      title: 'Free trial',
      detail: input.display.trialRemainingLabel,
      note: null,
      action: 'see_plans',
      actionLabel: 'See plans',
    };
  }
  if (input.display.statusLabel === 'Canceled') {
    return resolveCanceledSummary(input);
  }
  if (input.display.accessLabel === 'Paid') {
    return {
      title: input.planName,
      detail: 'Paid',
      note: input.display.periodLabel,
      action: 'manage',
      actionLabel: 'Manage',
    };
  }
  return {
    title: 'Free',
    detail: FREE_DETAIL,
    note: null,
    action: input.display.canOfferTrialAction ? 'start_trial' : 'see_plans',
    actionLabel: input.display.canOfferTrialAction ? 'Start free trial' : 'See plans',
  };
}

function resolveCanceledSummary(input: {
  readonly display: SubscriptionDisplay;
  readonly planName: string;
}): MeSubscriptionSummary {
  const stillPaid: boolean = input.display.accessLabel === 'Paid';
  return {
    title: stillPaid ? input.planName : 'Free',
    detail: stillPaid ? 'Paid' : FREE_DETAIL,
    note: input.display.cancelAccessNote,
    action: 'see_plans',
    actionLabel: 'See plans',
  };
}
