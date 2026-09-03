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
import { SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { PlanService } from '@/modules/subscription/plan.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Subscription cancel (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `cancel-owner-${Date.now()}@book.test`;
  const readerEmail = `cancel-reader-${Date.now()}@book.test`;
  const freeEmail = `cancel-free-${Date.now()}@book.test`;
  const emails = [ownerEmail, readerEmail, freeEmail];
  const slugSuffix = `${Date.now()}`;
  let app: INestApplication | undefined;
  let readerId: number | undefined;
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
      where: { slug: `cancel-${slugSuffix}` },
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

  async function completeCheckout(userId: number, accessToken: string): Promise<void> {
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
        id: `evt_checkout_cancel_${userId}`,
        type: 'checkout.session.completed',
        data: {
          object: {
            id: `cs_memory_cancel_${userId}`,
            customer: `cus_memory_cancel_${userId}`,
            subscription: `sub_memory_cancel_${userId}`,
            client_reference_id: String(userId),
            metadata: { planId: String(monthlyPlan.id) },
          },
        },
      });
  }

  async function publishCatalogBook(ownerId: number): Promise<BookEntity> {
    const category = await getRunningApp()
      .get(CategoryService)
      .createCategory({
        name: `Cancel ${slugSuffix}`,
        slug: `cancel-${slugSuffix}`,
      });
    const bookService: BookService = getRunningApp().get(BookService);
    const processingStatusService: BookProcessingStatusService = getRunningApp().get(
      BookProcessingStatusService,
    );
    const publishingStatusService: BookPublishingStatusService = getRunningApp().get(
      BookPublishingStatusService,
    );
    const created: BookEntity = await bookService.createBook({
      title: 'Cancel Harbor',
      description: 'Used by subscription cancel e2e tests.',
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

  it('Given a paid reader, When cancel is requested, Then status is canceled and reading continues until period end', async () => {
    const reader = await registerUser(readerEmail);
    readerId = reader.userId;
    readerAccessToken = reader.accessToken;
    const owner = await registerUser(ownerEmail);
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${owner.accessToken}`);
    const publishedBook = await publishCatalogBook(publisherResponse.body.user.id as number);
    publishedBookId = publishedBook.id;
    await completeCheckout(getReaderId(), getReaderAccessToken());
    const unauthenticated = await request(getServer()).post('/reader/billing/cancel');
    expect(unauthenticated.status).toBe(HttpStatus.UNAUTHORIZED);
    const actualResponse = await request(getServer())
      .post('/reader/billing/cancel')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.status).toBe(SubscriptionStatus.CANCELED);
    expect(actualResponse.body.canceledAt).toEqual(expect.any(String));
    expect(actualResponse.body).not.toHaveProperty('stripeSubscriptionId');
    expect(actualResponse.body.readingAccessState).toBe('paid');
    const progressResponse = await request(getServer())
      .put(`/reader/books/${getPublishedBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 1, scrollOffset: 40 });
    expect(progressResponse.status).toBe(HttpStatus.OK);
  });

  it('Given an already canceled reader, When cancel is requested again, Then the response stays canceled', async () => {
    const actualResponse = await request(getServer())
      .post('/reader/billing/cancel')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.status).toBe(SubscriptionStatus.CANCELED);
  });

  it('Given a free reader, When cancel is requested, Then it is not eligible', async () => {
    const freeUser = await registerUser(freeEmail);
    const actualResponse = await request(getServer())
      .post('/reader/billing/cancel')
      .set('Authorization', `Bearer ${freeUser.accessToken}`);
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('CANCEL_NOT_ELIGIBLE');
  });
});
