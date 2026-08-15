import type { INestApplication } from '@nestjs/common';

import { PLAN_SLUG } from '@/modules/subscription/consts/plan-slug.constant';
import { PlanService } from '@/modules/subscription/plan.service';
import { SubscriptionService } from '@/modules/subscription/subscription.service';

export async function assignMonthlySubscription(
  app: INestApplication,
  userId: number,
): Promise<void> {
  const planService: PlanService = app.get(PlanService);
  const subscriptionService: SubscriptionService = app.get(SubscriptionService);
  const monthlyPlan = await planService.getPlanBySlug(PLAN_SLUG.MONTHLY);
  const existing = await subscriptionService.findSubscriptionByUserId(userId);
  if (existing === null) {
    await subscriptionService.createSubscription({ userId, planId: monthlyPlan.id });
    return;
  }
  await subscriptionService.updateSubscription({ id: existing.id, planId: monthlyPlan.id });
}
