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
import { REFUND_WINDOW } from '@/modules/subscription/consts/refund-window.constant';
import { SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Subscription refund (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `refund-owner-${Date.now()}@book.test`;
  const readerEmail = `refund-reader-${Date.now()}@book.test`;
  const expiredEmail = `refund-expired-${Date.now()}@book.test`;
  const emails = [ownerEmail, readerEmail, expiredEmail];
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
      where: { slug: `refund-${slugSuffix}` },
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
    await request(getServer())
      .post('/reader/billing/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
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
          },
        },
      });
  }

  async function publishCatalogBook(ownerId: number): Promise<BookEntity> {
    const category = await getRunningApp()
      .get(CategoryService)
      .createCategory({
        name: `Refund ${slugSuffix}`,
        slug: `refund-${slugSuffix}`,
      });
    const bookService: BookService = getRunningApp().get(BookService);
    const processingStatusService: BookProcessingStatusService = getRunningApp().get(
      BookProcessingStatusService,
    );
    const publishingStatusService: BookPublishingStatusService = getRunningApp().get(
      BookPublishingStatusService,
    );
    const created: BookEntity = await bookService.createBook({
      title: 'Refund Harbor',
      description: 'Used by subscription refund e2e tests.',
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

  it('Given a paid reader inside the window, When a refund is requested, Then access is revoked', async () => {
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
    const unauthenticated = await request(getServer()).post('/reader/billing/refund');
    expect(unauthenticated.status).toBe(HttpStatus.UNAUTHORIZED);
    const actualResponse = await request(getServer())
      .post('/reader/billing/refund')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.status).toBe(SubscriptionStatus.CANCELED);
    expect(actualResponse.body).not.toHaveProperty('stripeSubscriptionId');
    const progressResponse = await request(getServer())
      .put(`/reader/books/${getPublishedBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 1, scrollOffset: 40 });
    expect(progressResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(progressResponse.body.code).toBe('FULL_BOOK_ACCESS_DENIED');
  });

  it('Given an already refunded reader, When a refund is requested again, Then it is not eligible', async () => {
    const actualResponse = await request(getServer())
      .post('/reader/billing/refund')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('REFUND_NOT_ELIGIBLE');
  });

  it('Given a paid reader after seven days, When a refund is requested, Then the window has expired', async () => {
    const expiredUser = await registerUser(expiredEmail);
    await completeCheckout(expiredUser.userId, expiredUser.accessToken);
    const subscriptionService: SubscriptionService = getRunningApp().get(SubscriptionService);
    const subscription = await subscriptionService.getSubscriptionByUserId(expiredUser.userId);
    await subscriptionService.updateSubscription({
      id: subscription.id,
      activatedAt: new Date(
        Date.now() - (REFUND_WINDOW.days + 1) * REFUND_WINDOW.millisecondsPerDay,
      ),
    });
    const actualResponse = await request(getServer())
      .post('/reader/billing/refund')
      .set('Authorization', `Bearer ${expiredUser.accessToken}`);
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('REFUND_WINDOW_EXPIRED');
  });
});
