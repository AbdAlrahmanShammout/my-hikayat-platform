import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { PLAN_SLUG } from '@/modules/subscription/consts/plan-slug.constant';
import { PlanKind, SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { PlanService } from '@/modules/subscription/plan.service';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { UserRole } from '@/modules/user/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Admin subscriptions (e2e)', () => {
  const password = 'correct-horse-battery';
  const adminEmail = `admin-subs-admin-${Date.now()}@user.test`;
  const readerEmail = `admin-subs-reader-${Date.now()}@user.test`;
  const emails = [adminEmail, readerEmail];
  let app: INestApplication | undefined;
  let adminUserId: number | undefined;
  let readerUserId: number | undefined;
  let subscriptionId: number | undefined;
  let adminAccessToken: string | undefined;
  let readerAccessToken: string | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.subscription.deleteMany({
      where: { user: { email: { in: emails } } },
    });
    await deleteUsersByEmail(prismaProviderService, emails);
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

  function getAdminAccessToken(): string {
    if (adminAccessToken === undefined) {
      throw new Error('Admin access token was not initialized');
    }
    return adminAccessToken;
  }

  function getReaderUserId(): number {
    if (readerUserId === undefined) {
      throw new Error('Reader user id was not initialized');
    }
    return readerUserId;
  }

  function getAdminUserId(): number {
    if (adminUserId === undefined) {
      throw new Error('Admin user id was not initialized');
    }
    return adminUserId;
  }

  function getSubscriptionId(): number {
    if (subscriptionId === undefined) {
      throw new Error('Subscription id was not initialized');
    }
    return subscriptionId;
  }

  it('Given no access token, When GET /admin/subscriptions, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/admin/subscriptions');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('Given a reader session, When GET /admin/subscriptions, Then access is denied', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    expect(registerResponse.status).toBe(HttpStatus.CREATED);
    readerUserId = registerResponse.body.user.id as number;
    readerAccessToken = registerResponse.body.accessToken as string;
    const actualResponse = await request(getServer())
      .get('/admin/subscriptions')
      .set('Authorization', `Bearer ${readerAccessToken}`);
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('ACCESS_DENIED');
  });

  it('Given an admin session, When subscriptions are listed and canceled, Then the change is persisted and audited', async () => {
    const adminRegister = await request(getServer()).post('/auth/register').send({
      email: adminEmail,
      password,
    });
    expect(adminRegister.status).toBe(HttpStatus.CREATED);
    adminUserId = adminRegister.body.user.id as number;
    const prismaProviderService: PrismaProviderService = getRunningApp().get(PrismaProviderService);
    await prismaProviderService.user.update({
      where: { id: getAdminUserId() },
      data: { role: UserRole.ADMIN },
    });
    const loginResponse = await request(getServer()).post('/auth/login').send({
      email: adminEmail,
      password,
    });
    adminAccessToken = loginResponse.body.accessToken as string;
    const planService: PlanService = getRunningApp().get(PlanService);
    const monthlyPlan = await planService.getPlanBySlug(PLAN_SLUG.MONTHLY);
    const subscriptionService: SubscriptionService = getRunningApp().get(SubscriptionService);
    const created = await subscriptionService.ensureFreeSubscription(getReaderUserId());
    const paid = await subscriptionService.updateSubscription({
      id: created.id,
      planId: monthlyPlan.id,
      stripeSubscriptionId: `sub_admin_${created.id}`,
    });
    subscriptionId = paid.id;
    const listResponse = await request(getServer())
      .get('/admin/subscriptions')
      .query({ userId: getReaderUserId() })
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(listResponse.status).toBe(HttpStatus.OK);
    expect(listResponse.body.total).toBe(1);
    expect(listResponse.body.subscriptions[0]).toEqual(
      expect.objectContaining({
        id: getSubscriptionId(),
        userId: getReaderUserId(),
        status: SubscriptionStatus.ACTIVE,
      }),
    );
    expect(listResponse.body.subscriptions[0].plan.kind).toBe(PlanKind.MONTHLY_PAID);
    expect(listResponse.body.subscriptions[0]).not.toHaveProperty('stripeSubscriptionId');
    const detailResponse = await request(getServer())
      .get(`/admin/subscriptions/${getSubscriptionId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(detailResponse.status).toBe(HttpStatus.OK);
    expect(detailResponse.body.id).toBe(getSubscriptionId());
    const cancelResponse = await request(getServer())
      .post(`/admin/subscriptions/${getSubscriptionId()}/cancel`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(cancelResponse.status).toBe(HttpStatus.OK);
    expect(cancelResponse.body.status).toBe(SubscriptionStatus.CANCELED);
    expect(cancelResponse.body.canceledAt).toEqual(expect.any(String));
    const auditResponse = await request(getServer())
      .get('/admin/audit-logs')
      .query({ action: AuditAction.SUBSCRIPTION_CANCELED, subjectId: getSubscriptionId() })
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(auditResponse.status).toBe(HttpStatus.OK);
    expect(auditResponse.body.total).toBeGreaterThanOrEqual(1);
    expect(auditResponse.body.auditLogs[0]).toEqual(
      expect.objectContaining({
        actorUserId: getAdminUserId(),
        action: AuditAction.SUBSCRIPTION_CANCELED,
        subjectType: AuditSubjectType.SUBSCRIPTION,
        subjectId: getSubscriptionId(),
      }),
    );
    const repeatResponse = await request(getServer())
      .post(`/admin/subscriptions/${getSubscriptionId()}/cancel`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(repeatResponse.status).toBe(HttpStatus.OK);
    expect(repeatResponse.body.status).toBe(SubscriptionStatus.CANCELED);
  });
});
