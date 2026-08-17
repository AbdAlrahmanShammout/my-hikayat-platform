export const SUBSCRIPTION_STATUS_FILTERS = ['active', 'canceled'] as const;

export type SubscriptionStatusFilter = (typeof SUBSCRIPTION_STATUS_FILTERS)[number];
