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
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { assignMonthlySubscription } from './assign-monthly-subscription';
import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Entitlement (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `entitlement-owner-${Date.now()}@book.test`;
  const freeEmail = `entitlement-free-${Date.now()}@book.test`;
  const paidEmail = `entitlement-paid-${Date.now()}@book.test`;
  const emails = [ownerEmail, freeEmail, paidEmail];
  const slugSuffix = `${Date.now()}`;
  const missingBookId = 999_999_999;
  let app: INestApplication | undefined;
  let publishedBookId: number | undefined;
  let freeAccessToken: string | undefined;
  let paidAccessToken: string | undefined;

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
      where: { slug: `entitlement-${slugSuffix}` },
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

  function getFreeAccessToken(): string {
    if (freeAccessToken === undefined) {
      throw new Error('Free access token was not created');
    }
    return freeAccessToken;
  }

  function getPaidAccessToken(): string {
    if (paidAccessToken === undefined) {
      throw new Error('Paid access token was not created');
    }
    return paidAccessToken;
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
        name: `Entitlement ${slugSuffix}`,
        slug: `entitlement-${slugSuffix}`,
      });
    const bookService: BookService = getRunningApp().get(BookService);
    const processingStatusService: BookProcessingStatusService = getRunningApp().get(
      BookProcessingStatusService,
    );
    const publishingStatusService: BookPublishingStatusService = getRunningApp().get(
      BookPublishingStatusService,
    );
    const created: BookEntity = await bookService.createBook({
      title: 'Entitlement Harbor',
      description: 'Used by entitlement e2e tests.',
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

  it('Given a free reader, When the catalog is listed, Then browsing is allowed', async () => {
    const freeUser = await registerUser(freeEmail);
    freeAccessToken = freeUser.accessToken;
    const actualResponse = await request(getServer())
      .get('/reader/catalog')
      .set('Authorization', `Bearer ${getFreeAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.total).toEqual(expect.any(Number));
  });

  it('Given a published book, When a free reader saves progress, Then paid access is required', async () => {
    const owner = await registerUser(ownerEmail);
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${owner.accessToken}`);
    const publishedBook = await publishCatalogBook(publisherResponse.body.user.id as number);
    publishedBookId = publishedBook.id;
    const actualResponse = await request(getServer())
      .put(`/reader/books/${getPublishedBookId()}/progress`)
      .set('Authorization', `Bearer ${getFreeAccessToken()}`)
      .send({ spineIndex: 0, scrollOffset: 0 });
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('FULL_BOOK_ACCESS_DENIED');
  });

  it('Given a published book, When a free reader searches in-book, Then paid access is required', async () => {
    const actualResponse = await request(getServer())
      .get(`/reader/search/${getPublishedBookId()}`)
      .query({ q: 'Harbor' })
      .set('Authorization', `Bearer ${getFreeAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('FULL_BOOK_ACCESS_DENIED');
  });

  it('Given a missing book, When a free reader saves progress, Then the book is not found', async () => {
    const actualResponse = await request(getServer())
      .put(`/reader/books/${missingBookId}/progress`)
      .set('Authorization', `Bearer ${getFreeAccessToken()}`)
      .send({ spineIndex: 0, scrollOffset: 0 });
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given a paid reader, When progress is saved, Then the position is stored', async () => {
    const paidUser = await registerUser(paidEmail);
    await assignMonthlySubscription(getRunningApp(), paidUser.userId);
    paidAccessToken = paidUser.accessToken;
    const actualResponse = await request(getServer())
      .put(`/reader/books/${getPublishedBookId()}/progress`)
      .set('Authorization', `Bearer ${getPaidAccessToken()}`)
      .send({ spineIndex: 1, scrollOffset: 40 });
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.bookId).toBe(getPublishedBookId());
    expect(actualResponse.body.spineIndex).toBe(1);
    expect(actualResponse.body.scrollOffset).toBe(40);
  });
});
