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
import { PlanKind, SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';

describe('Subscription billing (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `billing-owner-${Date.now()}@book.test`;
  const readerEmail = `billing-reader-${Date.now()}@book.test`;
  const emails = [ownerEmail, readerEmail];
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
      where: { slug: `billing-${slugSuffix}` },
    });
    await prismaProviderService.subscription.deleteMany({
      where: { user: { email: { in: emails } } },
    });
    await prismaProviderService.user.deleteMany({ where: { email: { in: emails } } });
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

  async function publishCatalogBook(ownerId: number): Promise<BookEntity> {
    const category = await getRunningApp()
      .get(CategoryService)
      .createCategory({
        name: `Billing ${slugSuffix}`,
        slug: `billing-${slugSuffix}`,
      });
    const bookService: BookService = getRunningApp().get(BookService);
    const processingStatusService: BookProcessingStatusService = getRunningApp().get(
      BookProcessingStatusService,
    );
    const publishingStatusService: BookPublishingStatusService = getRunningApp().get(
      BookPublishingStatusService,
    );
    const created: BookEntity = await bookService.createBook({
      title: 'Billing Harbor',
      description: 'Used by subscription billing e2e tests.',
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
    return publishingStatusService.approveBook(created.id);
  }

  it('Given a free reader, When the catalog is listed, Then browsing is allowed', async () => {
    const reader = await registerUser(readerEmail);
    readerId = reader.userId;
    readerAccessToken = reader.accessToken;
    const owner = await registerUser(ownerEmail);
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${owner.accessToken}`);
    const publishedBook = await publishCatalogBook(publisherResponse.body.user.id as number);
    publishedBookId = publishedBook.id;
    const actualResponse = await request(getServer())
      .get('/reader/catalog')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.total).toEqual(expect.any(Number));
  });

  it('Given no token, When checkout starts, Then the request is unauthenticated', async () => {
    const actualResponse = await request(getServer()).post('/reader/billing/checkout').send({
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel',
    });
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('Given a return URL on another origin, When checkout starts, Then the URL is rejected', async () => {
    const actualResponse = await request(getServer())
      .post('/reader/billing/checkout')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        successUrl: 'https://evil.test/success',
        cancelUrl: 'http://localhost:3000/cancel',
      });
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('CHECKOUT_RETURN_URL_INVALID');
  });

  it('Given a free reader, When checkout starts, Then a hosted checkout URL is returned', async () => {
    const actualResponse = await request(getServer())
      .post('/reader/billing/checkout')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      });
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.url).toBe(`https://checkout.stripe.test/cs_memory_${getReaderId()}`);
  });

  it('Given checkout completed, When the webhook is received, Then the subscription is monthly and active', async () => {
    const webhookResponse = await request(getServer())
      .post('/webhooks/stripe')
      .set('stripe-signature', 'test')
      .send({
        id: 'evt_checkout_completed',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: `cs_memory_${getReaderId()}`,
            customer: `cus_memory_${getReaderId()}`,
            subscription: `sub_memory_${getReaderId()}`,
            client_reference_id: String(getReaderId()),
          },
        },
      });
    expect(webhookResponse.status).toBe(HttpStatus.OK);
    expect(webhookResponse.body.received).toBe(true);
    const actualResponse = await request(getServer())
      .get('/reader/billing/subscription')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.status).toBe(SubscriptionStatus.ACTIVE);
    expect(actualResponse.body.plan.kind).toBe(PlanKind.MONTHLY_PAID);
    expect(actualResponse.body).not.toHaveProperty('stripeCustomerId');
  });

  it('Given a paid reader, When progress is saved, Then the position is stored', async () => {
    const actualResponse = await request(getServer())
      .put(`/reader/books/${getPublishedBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 1, scrollOffset: 40 });
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.bookId).toBe(getPublishedBookId());
  });

  it('Given an active monthly subscription, When checkout starts again, Then the request conflicts', async () => {
    const actualResponse = await request(getServer())
      .post('/reader/billing/checkout')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      });
    expect(actualResponse.status).toBe(HttpStatus.CONFLICT);
    expect(actualResponse.body.code).toBe('SUBSCRIPTION_ALREADY_PAID');
  });

  it('Given subscription deleted, When progress is saved, Then paid access is required', async () => {
    const webhookResponse = await request(getServer())
      .post('/webhooks/stripe')
      .set('stripe-signature', 'test')
      .send({
        id: 'evt_subscription_deleted',
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: `sub_memory_${getReaderId()}`,
            customer: `cus_memory_${getReaderId()}`,
            status: 'canceled',
          },
        },
      });
    expect(webhookResponse.status).toBe(HttpStatus.OK);
    const actualResponse = await request(getServer())
      .put(`/reader/books/${getPublishedBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 2, scrollOffset: 80 });
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('FULL_BOOK_ACCESS_DENIED');
  });
});
