import type { components } from '@/generated/admin';

export type AdminSubscriptionActionAvailability = {
  readonly canCancel: boolean;
  readonly cancelDisabledReason: string | null;
  readonly canRefund: boolean;
  readonly refundDisabledReason: string | null;
};

type AdminSubscriptionActionFields = {
  readonly status: components['schemas']['SubscriptionResponse']['status'];
  readonly plan?: Pick<NonNullable<components['schemas']['SubscriptionResponse']['plan']>, 'kind'>;
};

const ALREADY_CANCELED = 'This subscription is already canceled.';
const FREE_PLAN = 'The displayed plan kind is free. The API refunds paid monthly subscriptions.';

/**
 * UX hints from displayed status and plan kind. Backend still enforces refund rules.
 */
export function getAdminSubscriptionActionAvailability(
  subscription: AdminSubscriptionActionFields,
): AdminSubscriptionActionAvailability {
  if (subscription.status === 'canceled') {
    return {
      canCancel: false,
      cancelDisabledReason: ALREADY_CANCELED,
      canRefund: false,
      refundDisabledReason: ALREADY_CANCELED,
    };
  }
  if (subscription.plan?.kind === 'free') {
    return {
      canCancel: true,
      cancelDisabledReason: null,
      canRefund: false,
      refundDisabledReason: FREE_PLAN,
    };
  }
  return {
    canCancel: true,
    cancelDisabledReason: null,
    canRefund: true,
    refundDisabledReason: null,
  };
}
