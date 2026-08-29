import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

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
import { PLAN_SLUG } from '@/modules/subscription/consts/plan-slug.constant';
import { PlanKind } from '@/modules/subscription/enum/general.enum';
import { PlanService } from '@/modules/subscription/plan.service';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Subscription trial (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `trial-owner-${Date.now()}@book.test`;
  const readerEmail = `trial-reader-${Date.now()}@book.test`;
  const emails = [ownerEmail, readerEmail];
  const slugSuffix = `${Date.now()}`;
  let app: INestApplication | undefined;
  let publishedBookId: number | undefined;
  let readerUserId: number | undefined;
  let readerAccessToken: string | undefined;
  let monthlyPlanId: number | undefined;

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
      where: { slug: `trial-${slugSuffix}` },
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

  function getPublishedBookId(): number {
    if (publishedBookId === undefined) {
      throw new Error('Published book was not created');
    }
    return publishedBookId;
  }

  function getReaderAccessToken(): string {
    if (readerAccessToken === undefined) {
      throw new Error('Reader access token was not created');
    }
    return readerAccessToken;
  }

  function getReaderUserId(): number {
    if (readerUserId === undefined) {
      throw new Error('Reader user was not created');
    }
    return readerUserId;
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

  async function publishCatalogBook(ownerId: number): Promise<BookEntity> {
    const category = await getRunningApp()
      .get(CategoryService)
      .createCategory({
        name: `Trial ${slugSuffix}`,
        slug: `trial-${slugSuffix}`,
      });
    const bookService: BookService = getRunningApp().get(BookService);
    const processingStatusService: BookProcessingStatusService = getRunningApp().get(
      BookProcessingStatusService,
    );
    const publishingStatusService: BookPublishingStatusService = getRunningApp().get(
      BookPublishingStatusService,
    );
    const created: BookEntity = await bookService.createBook({
      title: 'Trial Harbor',
      description: 'Used by subscription trial e2e tests.',
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

  it('Given a new reader, When subscription is loaded, Then a free row is ensured and trial is eligible', async () => {
    const reader = await registerUser(readerEmail);
    readerUserId = reader.userId;
    readerAccessToken = reader.accessToken;
    const planService: PlanService = getRunningApp().get(PlanService);
    monthlyPlanId = (await planService.getPlanBySlug(PLAN_SLUG.MONTHLY)).id;
    const actualResponse = await request(getServer())
      .get('/reader/billing/subscription')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.plan.kind).toBe(PlanKind.FREE);
    expect(actualResponse.body.readingAccessState).toBe('free');
    expect(actualResponse.body.trialEligible).toBe(true);
    expect(actualResponse.body.trialStartedAt).toBeNull();
    expect(actualResponse.body.trialEndsAt).toBeNull();
  });

  it('Given a free reader, When progress is saved before trial, Then access is denied', async () => {
    const owner = await registerUser(ownerEmail);
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${owner.accessToken}`);
    const publishedBook = await publishCatalogBook(publisherResponse.body.user.id as number);
    publishedBookId = publishedBook.id;
    const actualResponse = await request(getServer())
      .put(`/reader/books/${getPublishedBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 0, scrollOffset: 1 });
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('FULL_BOOK_ACCESS_DENIED');
  });

  it('Given an eligible reader, When trial starts twice, Then the second call is idempotent', async () => {
    const firstResponse = await request(getServer())
      .post('/reader/billing/trial/start')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(firstResponse.status).toBe(HttpStatus.OK);
    expect(firstResponse.body.readingAccessState).toBe('trial');
    expect(firstResponse.body.trialEligible).toBe(false);
    expect(firstResponse.body.trialStartedAt).toEqual(expect.any(String));
    expect(firstResponse.body.trialEndsAt).toEqual(expect.any(String));
    const secondResponse = await request(getServer())
      .post('/reader/billing/trial/start')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(secondResponse.status).toBe(HttpStatus.OK);
    expect(secondResponse.body.trialStartedAt).toBe(firstResponse.body.trialStartedAt);
    expect(secondResponse.body.trialEndsAt).toBe(firstResponse.body.trialEndsAt);
  });

  it('Given an active trial, When progress is saved, Then the position is stored', async () => {
    const actualResponse = await request(getServer())
      .put(`/reader/books/${getPublishedBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 0, scrollOffset: 10 });
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.spineIndex).toBe(0);
  });

  it('Given an active trial, When checkout starts, Then a hosted checkout URL is returned', async () => {
    const actualResponse = await request(getServer())
      .post('/reader/billing/checkout')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        planId: monthlyPlanId,
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      });
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.url).toEqual(expect.any(String));
  });

  it('Given an active trial, When refund is requested, Then the subscription is not eligible', async () => {
    const actualResponse = await request(getServer())
      .post('/reader/billing/refund')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('REFUND_NOT_ELIGIBLE');
  });

  it('Given an expired trial, When progress is saved, Then access is denied and restart is rejected', async () => {
    const subscriptionService: SubscriptionService = getRunningApp().get(SubscriptionService);
    const subscription = await subscriptionService.getSubscriptionByUserId(getReaderUserId());
    await subscriptionService.updateSubscription({
      id: subscription.id,
      trialEndsAt: new Date('2020-01-01T00:00:00.000Z'),
    });
    const progressResponse = await request(getServer())
      .put(`/reader/books/${getPublishedBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 1, scrollOffset: 20 });
    expect(progressResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(progressResponse.body.code).toBe('FULL_BOOK_ACCESS_DENIED');
    const restartResponse = await request(getServer())
      .post('/reader/billing/trial/start')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(restartResponse.status).toBe(HttpStatus.CONFLICT);
    expect(restartResponse.body.code).toBe('TRIAL_ALREADY_USED');
    const subscriptionResponse = await request(getServer())
      .get('/reader/billing/subscription')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(subscriptionResponse.status).toBe(HttpStatus.OK);
    expect(subscriptionResponse.body.plan.kind).toBe(PlanKind.FREE);
    expect(subscriptionResponse.body.readingAccessState).toBe('free');
    expect(subscriptionResponse.body.trialEligible).toBe(false);
    expect(subscriptionResponse.body.trialStartedAt).not.toBeNull();
  });
});
