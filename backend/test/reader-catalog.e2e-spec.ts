import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookProcessingStatusService } from '@/modules/book/book-processing-status.service';
import { BookPublishingStatusService } from '@/modules/book/book-publishing-status.service';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { CatalogSort } from '@/modules/book/enum/catalog-sort.enum';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { CategoryService } from '@/modules/category/category.service';
import { ReadingProgressService } from '@/modules/reading/reading-progress.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { assignMonthlySubscription } from './assign-monthly-subscription';
import { createTestingApp } from './create-testing-app';

describe('Reader catalog (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `catalog-owner-${Date.now()}@book.test`;
  const readerEmail = `catalog-reader-${Date.now()}@book.test`;
  const emails = [ownerEmail, readerEmail];
  const slugSuffix = `${Date.now()}`;
  let app: INestApplication | undefined;
  let adventureCategoryId: number | undefined;
  let pictureCategoryId: number | undefined;
  let olderBookId: number | undefined;
  let newerBookId: number | undefined;
  let pendingBookId: number | undefined;
  let readerAccessToken: string | undefined;

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
      where: { slug: { in: [`adventure-${slugSuffix}`, `picture-${slugSuffix}`] } },
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

  function getAdventureCategoryId(): number {
    if (adventureCategoryId === undefined) {
      throw new Error('Adventure category was not created');
    }
    return adventureCategoryId;
  }

  function getPictureCategoryId(): number {
    if (pictureCategoryId === undefined) {
      throw new Error('Picture category was not created');
    }
    return pictureCategoryId;
  }

  function getOlderBookId(): number {
    if (olderBookId === undefined) {
      throw new Error('Older catalog book was not created');
    }
    return olderBookId;
  }

  function getNewerBookId(): number {
    if (newerBookId === undefined) {
      throw new Error('Newer catalog book was not created');
    }
    return newerBookId;
  }

  function getPendingBookId(): number {
    if (pendingBookId === undefined) {
      throw new Error('Pending book was not created');
    }
    return pendingBookId;
  }

  function getReaderAccessToken(): string {
    if (readerAccessToken === undefined) {
      throw new Error('Reader access token was not created');
    }
    return readerAccessToken;
  }

  async function registerUser(email: string): Promise<string> {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    return registerResponse.body.accessToken as string;
  }

  async function publishCatalogBook(input: {
    title: string;
    categoryIds: readonly number[];
    ownerId: number;
  }): Promise<BookEntity> {
    const bookService: BookService = getRunningApp().get(BookService);
    const processingStatusService: BookProcessingStatusService = getRunningApp().get(
      BookProcessingStatusService,
    );
    const publishingStatusService: BookPublishingStatusService = getRunningApp().get(
      BookPublishingStatusService,
    );
    const created: BookEntity = await bookService.createBook({
      title: input.title,
      description: 'Used by reader catalog e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: input.ownerId,
      categoryIds: input.categoryIds,
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

  it('Given no access token, When the catalog is listed, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/reader/catalog');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given published books, When the catalog is listed, Then newest approved books are returned', async () => {
    const ownerToken = await registerUser(ownerEmail);
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${ownerToken}`);
    const ownerId = publisherResponse.body.user.id as number;
    const categoryService: CategoryService = getRunningApp().get(CategoryService);
    const adventureCategory = await categoryService.createCategory({
      name: `Adventure ${slugSuffix}`,
      slug: `adventure-${slugSuffix}`,
    });
    adventureCategoryId = adventureCategory.id;
    const pictureCategory = await categoryService.createCategory({
      name: `Picture ${slugSuffix}`,
      slug: `picture-${slugSuffix}`,
    });
    pictureCategoryId = pictureCategory.id;
    const olderBook = await publishCatalogBook({
      title: 'Older Harbor',
      categoryIds: [getAdventureCategoryId()],
      ownerId,
    });
    olderBookId = olderBook.id;
    const newerBook = await publishCatalogBook({
      title: 'Newer Lighthouse',
      categoryIds: [getPictureCategoryId()],
      ownerId,
    });
    newerBookId = newerBook.id;
    const pendingBook = await getRunningApp()
      .get(BookService)
      .createBook({
        title: 'Unpublished Draft',
        description: 'Must not appear in the catalog.',
        layoutType: BookLayoutType.REFLOWABLE,
        bookType: BookType.STANDARD_CHAPTER,
        ownerId,
        categoryIds: [getAdventureCategoryId()],
      });
    pendingBookId = pendingBook.id;
    readerAccessToken = await registerUser(readerEmail);
    const actualResponse = await request(getServer())
      .get('/reader/catalog')
      .query({ limit: 100 })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    const catalogIds: number[] = (actualResponse.body.books as Array<{ id: number }>).map(
      (row) => row.id,
    );
    expect(actualResponse.body.total).toBeGreaterThanOrEqual(2);
    expect(catalogIds.indexOf(getNewerBookId())).toBeLessThan(catalogIds.indexOf(getOlderBookId()));
    expect(catalogIds).not.toContain(getPendingBookId());
  });

  it('Given a category filter, When the catalog is listed, Then only that category is returned', async () => {
    const actualResponse = await request(getServer())
      .get('/reader/catalog')
      .query({ categoryId: getAdventureCategoryId() })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.total).toBe(1);
    expect(actualResponse.body.books[0].id).toBe(getOlderBookId());
    expect(actualResponse.body.books[0].categories[0].id).toBe(getAdventureCategoryId());
  });

  it('Given progress on the older book, When popularity is requested, Then that book ranks first', async () => {
    const prismaProviderService: PrismaProviderService = getRunningApp().get(PrismaProviderService);
    const readerUser = await prismaProviderService.user.findFirst({
      where: { email: readerEmail },
    });
    if (readerUser === null) {
      throw new Error('Reader user was not created');
    }
    await assignMonthlySubscription(getRunningApp(), readerUser.id);
    await getRunningApp().get(ReadingProgressService).saveReadingProgress({
      userId: readerUser.id,
      bookId: getOlderBookId(),
      spineIndex: 0,
      scrollOffset: 0,
    });
    const actualResponse = await request(getServer())
      .get('/reader/catalog')
      .query({ sort: CatalogSort.POPULARITY, limit: 100 })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    const catalogIds: number[] = (actualResponse.body.books as Array<{ id: number }>).map(
      (row) => row.id,
    );
    expect(catalogIds.indexOf(getOlderBookId())).toBeLessThan(catalogIds.indexOf(getNewerBookId()));
  });

  it('Given a published book, When it is loaded, Then the catalog book is returned', async () => {
    const actualResponse = await request(getServer())
      .get(`/reader/catalog/${getNewerBookId()}`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.id).toBe(getNewerBookId());
    expect(actualResponse.body.publishingStatus).toBe(BookPublishingStatus.APPROVED);
  });

  it('Given a pending book, When it is loaded from the catalog, Then it is not found', async () => {
    const actualResponse = await request(getServer())
      .get(`/reader/catalog/${getPendingBookId()}`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given an unknown category, When the catalog is listed, Then the category is not found', async () => {
    const actualResponse = await request(getServer())
      .get('/reader/catalog')
      .query({ categoryId: 999999 })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given an invalid sort, When the catalog is listed, Then the query is rejected', async () => {
    const actualResponse = await request(getServer())
      .get('/reader/catalog')
      .query({ sort: 'oldest' })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(actualResponse.body.code).toBe('BAD_USER_INPUT');
  });
});
