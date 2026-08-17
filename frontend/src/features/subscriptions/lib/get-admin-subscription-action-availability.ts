import type { components } from '@/generated/admin';

export type AdminSubscriptionActionAvailability = {
  readonly canCancel: boolean;
  readonly cancelDisabledReason: string | null;
};

/**
 * UX hint from displayed status. Backend still enforces cancel rules.
 */
export function getAdminSubscriptionActionAvailability(
  subscription: Pick<components['schemas']['SubscriptionResponse'], 'status'>,
): AdminSubscriptionActionAvailability {
  if (subscription.status === 'canceled') {
    return {
      canCancel: false,
      cancelDisabledReason: 'This subscription is already canceled.',
    };
  }
  return {
    canCancel: true,
    cancelDisabledReason: null,
  };
}
