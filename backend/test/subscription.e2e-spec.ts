import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { PLAN_SLUG } from '@/modules/subscription/consts/plan-slug.constant';
import {
  PlanKind,
  PlanInterval,
  SubscriptionStatus,
} from '@/modules/subscription/enum/general.enum';
import { PlanService } from '@/modules/subscription/plan.service';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Subscription domain (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `subscription-owner-${Date.now()}@book.test`;
  let app: INestApplication | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.subscription.deleteMany({
      where: { user: { email: ownerEmail } },
    });
    await deleteUsersByEmail(prismaProviderService, ownerEmail);
    await app.close();
  });

  function getRunningApp(): INestApplication {
    if (!app) {
      throw new Error('Application was not initialized');
    }
    return app;
  }

  function getServer(): Server {
    return getRunningApp().getHttpServer() as Server;
  }

  it('Given a reader, When a free subscription is ensured, Then the seeded free plan is assigned once', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: ownerEmail,
      password,
    });
    const ownerId = registerResponse.body.user.id as number;
    const planService: PlanService = getRunningApp().get(PlanService);
    const plans = await planService.listPlans();
    const slugs: string[] = plans.entities.map((plan) => plan.slug);
    expect(slugs).toEqual(expect.arrayContaining([PLAN_SLUG.FREE, PLAN_SLUG.MONTHLY]));
    const freePlan = await planService.getPlanBySlug(PLAN_SLUG.FREE);
    expect(freePlan.kind).toBe(PlanKind.FREE);
    expect(freePlan.interval).toBeNull();
    const monthlyPlan = await planService.getPlanBySlug(PLAN_SLUG.MONTHLY);
    expect(monthlyPlan.kind).toBe(PlanKind.MONTHLY_PAID);
    expect(monthlyPlan.interval).toBe(PlanInterval.MONTH);
    const subscriptionService: SubscriptionService = getRunningApp().get(SubscriptionService);
    const created = await subscriptionService.ensureFreeSubscription(ownerId);
    expect(created.userId).toBe(ownerId);
    expect(created.planId).toBe(freePlan.id);
    expect(created.status).toBe(SubscriptionStatus.ACTIVE);
    const ensuredAgain = await subscriptionService.ensureFreeSubscription(ownerId);
    expect(ensuredAgain.id).toBe(created.id);
    await expect(
      subscriptionService.createSubscription({ userId: ownerId, planId: monthlyPlan.id }),
    ).rejects.toMatchObject({ code: 'SUBSCRIPTION_ALREADY_EXISTS' });
    const canceled = await subscriptionService.cancelSubscription(created.id);
    expect(canceled.status).toBe(SubscriptionStatus.CANCELED);
    expect(canceled.canceledAt).toBeInstanceOf(Date);
  });
});
