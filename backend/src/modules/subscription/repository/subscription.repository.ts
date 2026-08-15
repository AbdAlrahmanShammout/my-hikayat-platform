import { TransactionContext } from '@/common/base/transaction-context';
import {
  CreateSubscriptionRepoInput,
  ListSubscriptionsRepoInput,
  SubscriptionPage,
  UpdateSubscriptionRepoInput,
} from '@/modules/subscription/defs/subscription-repository.defs';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';

export abstract class SubscriptionRepository {
  abstract create(
    input: CreateSubscriptionRepoInput,
    context?: TransactionContext,
  ): Promise<SubscriptionEntity>;
  abstract update(
    input: UpdateSubscriptionRepoInput,
    context?: TransactionContext,
  ): Promise<SubscriptionEntity>;
  abstract findById(id: number): Promise<SubscriptionEntity | null>;
  abstract findByUserId(userId: number): Promise<SubscriptionEntity | null>;
  abstract findByStripeCustomerId(stripeCustomerId: string): Promise<SubscriptionEntity | null>;
  abstract findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<SubscriptionEntity | null>;
  abstract list(input: ListSubscriptionsRepoInput): Promise<SubscriptionPage>;
}
