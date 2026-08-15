import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { SubscriptionStatus } from '@/modules/subscription/enum/general.enum';

export type CreateSubscriptionRepoInput = {
  readonly userId: number;
  readonly planId: number;
  readonly status: SubscriptionStatus;
  readonly startedAt: Date;
  readonly currentPeriodStart: Date | null;
  readonly currentPeriodEnd: Date | null;
  readonly stripeCustomerId?: string | null;
  readonly stripeSubscriptionId?: string | null;
};

export type UpdateSubscriptionRepoInput = {
  readonly id: number;
  readonly planId?: number;
  readonly status?: SubscriptionStatus;
  readonly currentPeriodStart?: Date | null;
  readonly currentPeriodEnd?: Date | null;
  readonly canceledAt?: Date | null;
  readonly stripeCustomerId?: string | null;
  readonly stripeSubscriptionId?: string | null;
};

export type ListSubscriptionsRepoInput = {
  readonly limit: number;
  readonly offset: number;
  readonly userId?: number;
  readonly status?: SubscriptionStatus;
};

export type SubscriptionPage = {
  readonly entities: SubscriptionEntity[];
  readonly total: number;
};
