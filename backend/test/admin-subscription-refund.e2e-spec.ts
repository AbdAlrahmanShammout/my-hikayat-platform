import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { BookProcessingStatusService } from '@/modules/book/book-processing-status.service';
import { BookPublishingStatusService } from '@/modules/book/book-publishing-status.service';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { CategoryService } from '@/modules/category/category.service';
import { REFUND_WINDOW } from '@/modules/subscription/consts/refund-window.constant';
import { SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { PLAN_SLUG } from '@/modules/subscription/consts/plan-slug.constant';
import { PlanService } from '@/modules/subscription/plan.service';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { UserRole } from '@/modules/user/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Admin subscription refund (e2e)', () => {
  const password = 'correct-horse-battery';
  const adminEmail = `admin-refund-admin-${Date.now()}@book.test`;
  const ownerEmail = `admin-refund-owner-${Date.now()}@book.test`;
  const readerEmail = `admin-refund-reader-${Date.now()}@book.test`;
  const expiredEmail = `admin-refund-expired-${Date.now()}@book.test`;
  const emails = [adminEmail, ownerEmail, readerEmail, expiredEmail];
  const slugSuffix = `${Date.now()}`;
  let app: INestApplication | undefined;
  let adminUserId: number | undefined;
  let readerId: number | undefined;
  let subscriptionId: number | undefined;
  let adminAccessToken: string | undefined;
  let readerAccessToken: string | undefined;
  let publishedBookId: number | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.readingProgress.deleteMany({
      where: {
        OR: [{ user: { email: { in: emails } } }, { book: { owner: { email: { in: emails } } } }],
      },
    });
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: { in: emails } } },
    });
    await prismaProviderService.category.deleteMany({
      where: { slug: `admin-refund-${slugSuffix}` },
    });
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
      throw new Error('Admin access token was not created');
    }
    return adminAccessToken;
  }

  function getAdminUserId(): number {
    if (adminUserId === undefined) {
      throw new Error('Admin user was not created');
    }
    return adminUserId;
  }

  function getReaderAccessToken(): string {
    if (readerAccessToken === undefined) {
      throw new Error('Reader access token was not created');
    }
    return readerAccessToken;
  }

  function getReaderId(): number {
    if (readerId === undefined) {
      throw new Error('Reader was not created');
    }
    return readerId;
  }

  function getSubscriptionId(): number {
    if (subscriptionId === undefined) {
      throw new Error('Subscription was not created');
    }
    return subscriptionId;
  }

  function getPublishedBookId(): number {
    if (publishedBookId === undefined) {
      throw new Error('Published book was not created');
    }
    return publishedBookId;
  }

  async function registerUser(email: string): Promise<{ userId: number; accessToken: string }> {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    return {
      userId: registerResponse.body.user.id as number,
      accessToken: registerResponse.body.accessToken as string,
    };
  }

  async function completeCheckout(userId: number, accessToken: string): Promise<number> {
    const planService: PlanService = getRunningApp().get(PlanService);
    const monthlyPlan = await planService.getPlanBySlug(PLAN_SLUG.MONTHLY);
    await request(getServer())
      .post('/reader/billing/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        planId: monthlyPlan.id,
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      });
    await request(getServer())
      .post('/webhooks/stripe')
      .set('stripe-signature', 'test')
      .send({
        id: `evt_checkout_${userId}`,
        type: 'checkout.session.completed',
        data: {
          object: {
            id: `cs_memory_${userId}`,
            customer: `cus_memory_${userId}`,
            subscription: `sub_memory_${userId}`,
            client_reference_id: String(userId),
            metadata: { planId: String(monthlyPlan.id) },
          },
        },
      });
    const subscription = await getRunningApp()
      .get(SubscriptionService)
      .getSubscriptionByUserId(userId);
    return subscription.id;
  }

  async function publishCatalogBook(ownerId: number): Promise<BookEntity> {
    const category = await getRunningApp()
      .get(CategoryService)
      .createCategory({
        name: `Admin Refund ${slugSuffix}`,
        slug: `admin-refund-${slugSuffix}`,
      });
    const bookService: BookService = getRunningApp().get(BookService);
    const processingStatusService: BookProcessingStatusService = getRunningApp().get(
      BookProcessingStatusService,
    );
    const publishingStatusService: BookPublishingStatusService = getRunningApp().get(
      BookPublishingStatusService,
    );
    const created: BookEntity = await bookService.createBook({
      title: 'Admin Refund Harbor',
      description: 'Used by admin subscription refund e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
      categoryIds: [category.id],
    });
    await processingStatusService.transitionProcessingStatus({
      bookId: created.id,
      to: BookProcessingStatus.PROCESSING,
    });
    await processingStatusService.transitionProcessingStatus({
      bookId: created.id,
      to: BookProcessingStatus.READY,
    });
    await publishingStatusService.transitionPublishingStatus({
      bookId: created.id,
      to: BookPublishingStatus.IN_REVIEW,
    });
    return publishingStatusService.transitionPublishingStatus({
      bookId: created.id,
      to: BookPublishingStatus.APPROVED,
      publishedAt: new Date(),
    });
  }

  it('Given no access token, When an admin refund is requested, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).post('/admin/subscriptions/1/refund');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given a paid reader inside the window, When an admin refunds, Then access is revoked and audited', async () => {
    const reader = await registerUser(readerEmail);
    readerId = reader.userId;
    readerAccessToken = reader.accessToken;
    const owner = await registerUser(ownerEmail);
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${owner.accessToken}`);
    const publishedBook = await publishCatalogBook(publisherResponse.body.user.id as number);
    publishedBookId = publishedBook.id;
    const admin = await registerUser(adminEmail);
    adminUserId = admin.userId;
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
    subscriptionId = await completeCheckout(getReaderId(), getReaderAccessToken());
    const readerDenied = await request(getServer())
      .post(`/admin/subscriptions/${getSubscriptionId()}/refund`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(readerDenied.status).toBe(HttpStatus.FORBIDDEN);
    expect(readerDenied.body.code).toBe('ACCESS_DENIED');
    const actualResponse = await request(getServer())
      .post(`/admin/subscriptions/${getSubscriptionId()}/refund`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.status).toBe(SubscriptionStatus.CANCELED);
    expect(actualResponse.body.currentPeriodEnd).toEqual(expect.any(String));
    expect(actualResponse.body).not.toHaveProperty('stripeSubscriptionId');
    const progressResponse = await request(getServer())
      .put(`/reader/books/${getPublishedBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 1, scrollOffset: 40 });
    expect(progressResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(progressResponse.body.code).toBe('FULL_BOOK_ACCESS_DENIED');
    const auditResponse = await request(getServer())
      .get('/admin/audit-logs')
      .query({
        action: AuditAction.SUBSCRIPTION_CANCELED,
        subjectType: AuditSubjectType.SUBSCRIPTION,
        subjectId: getSubscriptionId(),
      })
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(auditResponse.status).toBe(HttpStatus.OK);
    expect(auditResponse.body.total).toBe(1);
    expect(auditResponse.body.auditLogs[0]).toEqual(
      expect.objectContaining({
        actorUserId: getAdminUserId(),
        action: AuditAction.SUBSCRIPTION_CANCELED,
        subjectType: AuditSubjectType.SUBSCRIPTION,
        subjectId: getSubscriptionId(),
      }),
    );
    expect(auditResponse.body.auditLogs[0].metadata).toEqual(
      expect.objectContaining({ refunded: true }),
    );
  });

  it('Given an already refunded subscription, When an admin refunds again, Then it is not eligible', async () => {
    const actualResponse = await request(getServer())
      .post(`/admin/subscriptions/${getSubscriptionId()}/refund`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('REFUND_NOT_ELIGIBLE');
  });

  it('Given a missing subscription, When an admin refunds, Then the subscription is hidden', async () => {
    const actualResponse = await request(getServer())
      .post('/admin/subscriptions/999999/refund')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given a paid reader after seven days, When an admin refunds, Then the window has expired', async () => {
    const expiredUser = await registerUser(expiredEmail);
    const expiredSubscriptionId = await completeCheckout(
      expiredUser.userId,
      expiredUser.accessToken,
    );
    const subscriptionService: SubscriptionService = getRunningApp().get(SubscriptionService);
    await subscriptionService.updateSubscription({
      id: expiredSubscriptionId,
      activatedAt: new Date(
        Date.now() - (REFUND_WINDOW.days + 1) * REFUND_WINDOW.millisecondsPerDay,
      ),
    });
    const actualResponse = await request(getServer())
      .post(`/admin/subscriptions/${expiredSubscriptionId}/refund`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('REFUND_WINDOW_EXPIRED');
  });
});
