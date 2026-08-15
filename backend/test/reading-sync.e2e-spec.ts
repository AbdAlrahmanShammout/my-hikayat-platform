import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookLayoutType, BookType } from '@/modules/book/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { assignMonthlySubscription } from './assign-monthly-subscription';
import { createTestingApp } from './create-testing-app';

describe('Reading cross-device sync (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `reading-sync-owner-${Date.now()}@book.test`;
  const readerEmail = `reading-sync-reader-${Date.now()}@book.test`;
  const otherEmail = `reading-sync-other-${Date.now()}@book.test`;
  const emails = [ownerEmail, readerEmail, otherEmail];
  let app: INestApplication | undefined;
  let reflowableBookId: number | undefined;
  let fixedBookId: number | undefined;
  let unreadBookId: number | undefined;
  let readerAccessToken: string | undefined;
  let otherAccessToken: string | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.readingBookmark.deleteMany({
      where: {
        OR: [{ user: { email: { in: emails } } }, { book: { owner: { email: { in: emails } } } }],
      },
    });
    await prismaProviderService.readingProgress.deleteMany({
      where: {
        OR: [{ user: { email: { in: emails } } }, { book: { owner: { email: { in: emails } } } }],
      },
    });
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: { in: emails } } },
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

  function getReflowableBookId(): number {
    if (reflowableBookId === undefined) {
      throw new Error('Reflowable book was not created');
    }
    return reflowableBookId;
  }

  function getFixedBookId(): number {
    if (fixedBookId === undefined) {
      throw new Error('Fixed-layout book was not created');
    }
    return fixedBookId;
  }

  function getUnreadBookId(): number {
    if (unreadBookId === undefined) {
      throw new Error('Unread book was not created');
    }
    return unreadBookId;
  }

  function getReaderAccessToken(): string {
    if (readerAccessToken === undefined) {
      throw new Error('Reader access token was not created');
    }
    return readerAccessToken;
  }

  function getOtherAccessToken(): string {
    if (otherAccessToken === undefined) {
      throw new Error('Other access token was not created');
    }
    return otherAccessToken;
  }

  async function registerUser(email: string): Promise<string> {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    await assignMonthlySubscription(getRunningApp(), registerResponse.body.user.id as number);
    return registerResponse.body.accessToken as string;
  }

  it('Given no access token, When sync is pulled, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/reader/sync');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given progress and bookmarks on two layouts, When sync is pulled, Then both positions are returned', async () => {
    const ownerToken = await registerUser(ownerEmail);
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${ownerToken}`);
    const ownerId = publisherResponse.body.user.id as number;
    const bookService: BookService = getRunningApp().get(BookService);
    const reflowableBook = await bookService.createBook({
      title: 'Sync Reflowable Fixture',
      description: 'Used by reading sync e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
    });
    reflowableBookId = reflowableBook.id;
    const fixedBook = await bookService.createBook({
      title: 'Sync Fixed Fixture',
      description: 'Used by reading sync e2e tests.',
      layoutType: BookLayoutType.FIXED_LAYOUT,
      bookType: BookType.PICTURE_BOOK,
      ownerId,
    });
    fixedBookId = fixedBook.id;
    const unreadBook = await bookService.createBook({
      title: 'Sync Unread Fixture',
      description: 'Used by reading sync e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
    });
    unreadBookId = unreadBook.id;
    readerAccessToken = await registerUser(readerEmail);
    otherAccessToken = await registerUser(otherEmail);
    const reflowableProgress = await request(getServer())
      .put(`/reader/books/${getReflowableBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 2, scrollOffset: 640 });
    expect(reflowableProgress.status).toBe(HttpStatus.OK);
    const fixedProgress = await request(getServer())
      .put(`/reader/books/${getFixedBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spreadIndex: 1, pageNumber: 3 });
    expect(fixedProgress.status).toBe(HttpStatus.OK);
    const reflowableBookmark = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/bookmarks`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 1, scrollOffset: 80 });
    expect(reflowableBookmark.status).toBe(HttpStatus.CREATED);
    const fixedBookmark = await request(getServer())
      .post(`/reader/books/${getFixedBookId()}/bookmarks`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spreadIndex: 2, pageNumber: 5 });
    expect(fixedBookmark.status).toBe(HttpStatus.CREATED);
    const actualResponse = await request(getServer())
      .get('/reader/sync')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.progressTotal).toBe(2);
    expect(actualResponse.body.bookmarksTotal).toBe(2);
    expect(actualResponse.body.progress).toHaveLength(2);
    expect(actualResponse.body.bookmarks).toHaveLength(2);
    const syncedProgress: Array<{
      bookId: number;
      layoutType: string;
      spineIndex: number | null;
      scrollOffset: number | null;
      spreadIndex: number | null;
      pageNumber: number | null;
    }> = actualResponse.body.progress;
    const reflowableSync = syncedProgress.find((row) => row.bookId === getReflowableBookId());
    const fixedSync = syncedProgress.find((row) => row.bookId === getFixedBookId());
    expect(reflowableSync).toBeDefined();
    expect(fixedSync).toBeDefined();
    expect(reflowableSync?.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(reflowableSync?.spineIndex).toBe(2);
    expect(reflowableSync?.scrollOffset).toBe(640);
    expect(reflowableSync?.spreadIndex).toBeNull();
    expect(fixedSync?.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
    expect(fixedSync?.spreadIndex).toBe(1);
    expect(fixedSync?.pageNumber).toBe(3);
    expect(fixedSync?.spineIndex).toBeNull();
  });

  it('Given a book id, When book sync is pulled, Then only that book is returned', async () => {
    const actualResponse = await request(getServer())
      .get(`/reader/books/${getFixedBookId()}/sync`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.progressTotal).toBe(1);
    expect(actualResponse.body.bookmarksTotal).toBe(1);
    expect(actualResponse.body.progress[0].bookId).toBe(getFixedBookId());
    expect(actualResponse.body.progress[0].spreadIndex).toBe(1);
    expect(actualResponse.body.bookmarks[0].pageNumber).toBe(5);
  });

  it('Given an unread book, When book sync is pulled, Then empty collections are returned', async () => {
    const actualResponse = await request(getServer())
      .get(`/reader/books/${getUnreadBookId()}/sync`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.progressTotal).toBe(0);
    expect(actualResponse.body.bookmarksTotal).toBe(0);
    expect(actualResponse.body.progress).toEqual([]);
    expect(actualResponse.body.bookmarks).toEqual([]);
  });

  it('Given another reader, When they pull sync, Then they do not receive the first reader rows', async () => {
    const actualResponse = await request(getServer())
      .get('/reader/sync')
      .set('Authorization', `Bearer ${getOtherAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.progressTotal).toBe(0);
    expect(actualResponse.body.bookmarksTotal).toBe(0);
  });

  it('Given a future updatedSince, When sync is pulled, Then matching rows are empty', async () => {
    const actualResponse = await request(getServer())
      .get('/reader/sync')
      .query({ updatedSince: '2099-01-01T00:00:00.000Z' })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.progressTotal).toBe(0);
    expect(actualResponse.body.bookmarksTotal).toBe(0);
  });

  it('Given a missing book, When book sync is pulled, Then the book is not found', async () => {
    const actualResponse = await request(getServer())
      .get('/reader/books/999999/sync')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });
});
