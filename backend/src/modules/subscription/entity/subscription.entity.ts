import { BaseEntity } from '@/common/base/base.entity';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { SubscriptionZodType } from '@/modules/subscription/zod/subscription.zod';
import { UserEntity } from '@/modules/user/entity/user.entity';

export class SubscriptionEntity extends BaseEntity {
  userId!: number;
  planId!: number;
  status!: SubscriptionStatus;
  startedAt!: Date;
  currentPeriodStart!: Date | null;
  currentPeriodEnd!: Date | null;
  canceledAt!: Date | null;
  activatedAt!: Date | null;
  trialStartedAt!: Date | null;
  trialEndsAt!: Date | null;
  stripeCustomerId!: string | null;
  stripeSubscriptionId!: string | null;
  plan?: PlanEntity;
  user?: UserEntity;

  constructor(data: SubscriptionZodType) {
    super();
    Object.assign(this, data);
  }
}
