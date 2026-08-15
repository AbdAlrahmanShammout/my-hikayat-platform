import { SubscriptionStatus } from '@/modules/subscription/enum/general.enum';

export type CreateSubscriptionServiceInput = {
  readonly userId: number;
  readonly planId: number;
  readonly currentPeriodStart?: Date | null;
  readonly currentPeriodEnd?: Date | null;
};

export type UpdateSubscriptionServiceInput = {
  readonly id: number;
  readonly planId?: number;
  readonly status?: SubscriptionStatus;
  readonly currentPeriodStart?: Date | null;
  readonly currentPeriodEnd?: Date | null;
  readonly canceledAt?: Date | null;
  readonly stripeCustomerId?: string | null;
  readonly stripeSubscriptionId?: string | null;
};

export type ListSubscriptionsServiceInput = {
  readonly limit?: number;
  readonly offset?: number;
  readonly userId?: number;
  readonly status?: SubscriptionStatus;
};
