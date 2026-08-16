import type { INestApplication } from '@nestjs/common';

import { PLAN_SLUG } from '@/modules/subscription/consts/plan-slug.constant';
import { SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { PlanService } from '@/modules/subscription/plan.service';
import { SubscriptionService } from '@/modules/subscription/subscription.service';

const MILLISECONDS_PER_DAY: number = 24 * 60 * 60 * 1000;
const DEFAULT_PAID_PERIOD_DAYS: number = 30;

type AssignMonthlySubscriptionOptions = {
  readonly currentPeriodEnd?: Date;
  readonly status?: SubscriptionStatus;
};

export async function assignMonthlySubscription(
  app: INestApplication,
  userId: number,
  options: AssignMonthlySubscriptionOptions = {},
): Promise<void> {
  const planService: PlanService = app.get(PlanService);
  const subscriptionService: SubscriptionService = app.get(SubscriptionService);
  const monthlyPlan = await planService.getPlanBySlug(PLAN_SLUG.MONTHLY);
  const now: Date = new Date();
  const currentPeriodEnd: Date =
    options.currentPeriodEnd ??
    new Date(now.getTime() + DEFAULT_PAID_PERIOD_DAYS * MILLISECONDS_PER_DAY);
  const status: SubscriptionStatus = options.status ?? SubscriptionStatus.ACTIVE;
  const existing = await subscriptionService.findSubscriptionByUserId(userId);
  if (existing === null) {
    const created = await subscriptionService.createSubscription({
      userId,
      planId: monthlyPlan.id,
      currentPeriodStart: now,
      currentPeriodEnd,
    });
    if (status === SubscriptionStatus.CANCELED) {
      await subscriptionService.cancelSubscription(created.id);
      await subscriptionService.updateSubscription({
        id: created.id,
        currentPeriodEnd,
      });
    }
    return;
  }
  await subscriptionService.updateSubscription({
    id: existing.id,
    planId: monthlyPlan.id,
    status,
    currentPeriodStart: now,
    currentPeriodEnd,
    canceledAt: status === SubscriptionStatus.CANCELED ? now : null,
  });
}
