import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { SubscriptionStatus } from '@/modules/subscription/enum/general.enum';

export type CreateSubscriptionRepoInput = {
  readonly userId: number;
  readonly planId: number;
  readonly status: SubscriptionStatus;
  readonly startedAt: Date;
  readonly currentPeriodStart: Date | null;
  readonly currentPeriodEnd: Date | null;
  readonly activatedAt?: Date | null;
  readonly trialStartedAt?: Date | null;
  readonly trialEndsAt?: Date | null;
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
  readonly activatedAt?: Date | null;
  readonly trialStartedAt?: Date | null;
  readonly trialEndsAt?: Date | null;
  readonly stripeCustomerId?: string | null;
  readonly stripeSubscriptionId?: string | null;
};

export type StartTrialIfUnusedRepoInput = {
  readonly userId: number;
  readonly trialStartedAt: Date;
  readonly trialEndsAt: Date;
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
