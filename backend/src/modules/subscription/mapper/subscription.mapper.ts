import { PlanMapper } from '@/modules/subscription/mapper/plan.mapper';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { SubscriptionDetailsType } from '@/modules/subscription/types/subscription-details-schema.type';

export class SubscriptionMapper {
  static toEntity(schema: SubscriptionDetailsType): SubscriptionEntity {
    return new SubscriptionEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      userId: schema.userId,
      planId: schema.planId,
      status: schema.status as SubscriptionStatus,
      startedAt: schema.startedAt,
      currentPeriodStart: schema.currentPeriodStart,
      currentPeriodEnd: schema.currentPeriodEnd,
      canceledAt: schema.canceledAt,
      activatedAt: schema.activatedAt,
      trialStartedAt: schema.trialStartedAt,
      trialEndsAt: schema.trialEndsAt,
      stripeCustomerId: schema.stripeCustomerId,
      stripeSubscriptionId: schema.stripeSubscriptionId,
      plan: schema.plan === undefined ? undefined : PlanMapper.toEntity(schema.plan),
    });
  }
}
