import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookLayoutType, BookType } from '@/modules/book/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { assignMonthlySubscription } from './assign-monthly-subscription';
import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Reading bookmarks (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `reading-bookmark-owner-${Date.now()}@book.test`;
  const readerEmail = `reading-bookmark-reader-${Date.now()}@book.test`;
  const otherEmail = `reading-bookmark-other-${Date.now()}@book.test`;
  const emails = [ownerEmail, readerEmail, otherEmail];
  let app: INestApplication | undefined;
  let reflowableBookId: number | undefined;
  let fixedBookId: number | undefined;
  let unknownLayoutBookId: number | undefined;
  let readerAccessToken: string | undefined;
  let otherAccessToken: string | undefined;
  let reflowableBookmarkId: number | undefined;

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
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: { in: emails } } },
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

  function getUnknownLayoutBookId(): number {
    if (unknownLayoutBookId === undefined) {
      throw new Error('Unknown-layout book was not created');
    }
    return unknownLayoutBookId;
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

  function getReflowableBookmarkId(): number {
    if (reflowableBookmarkId === undefined) {
      throw new Error('Reflowable bookmark was not created');
    }
    return reflowableBookmarkId;
  }

  async function registerUser(email: string): Promise<string> {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    await assignMonthlySubscription(getRunningApp(), registerResponse.body.user.id as number);
    return registerResponse.body.accessToken as string;
  }

  it('Given no access token, When a bookmark is created, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).post('/reader/books/1/bookmarks').send({
      spineIndex: 0,
      scrollOffset: 0,
    });
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given a reflowable book, When the reader creates a bookmark, Then spine index and scroll offset persist', async () => {
    const ownerToken = await registerUser(ownerEmail);
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${ownerToken}`);
    const ownerId = publisherResponse.body.user.id as number;
    const bookService: BookService = getRunningApp().get(BookService);
    const reflowableBook = await bookService.createBook({
      title: 'Reflowable Bookmark Fixture',
      description: 'Used by reading-bookmark e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
    });
    reflowableBookId = reflowableBook.id;
    const fixedBook = await bookService.createBook({
      title: 'Fixed Bookmark Fixture',
      description: 'Used by reading-bookmark e2e tests.',
      layoutType: BookLayoutType.FIXED_LAYOUT,
      bookType: BookType.PICTURE_BOOK,
      ownerId,
    });
    fixedBookId = fixedBook.id;
    const unknownLayoutBook = await bookService.createBook({
      title: 'Unknown Layout Bookmark Fixture',
      description: 'Used by reading-bookmark e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
    });
    unknownLayoutBookId = unknownLayoutBook.id;
    readerAccessToken = await registerUser(readerEmail);
    otherAccessToken = await registerUser(otherEmail);
    const actualResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/bookmarks`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 2, scrollOffset: 640 });
    expect(actualResponse.status).toBe(HttpStatus.CREATED);
    expect(actualResponse.body.bookId).toBe(getReflowableBookId());
    expect(actualResponse.body.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualResponse.body.spineIndex).toBe(2);
    expect(actualResponse.body.scrollOffset).toBe(640);
    expect(actualResponse.body.spreadIndex).toBeNull();
    expect(actualResponse.body.pageNumber).toBeNull();
    reflowableBookmarkId = actualResponse.body.id as number;
  });

  it('Given a second reflowable bookmark, When the reader lists bookmarks, Then total is the real count', async () => {
    const createResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/bookmarks`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 4, scrollOffset: 80 });
    expect(createResponse.status).toBe(HttpStatus.CREATED);
    const listResponse = await request(getServer())
      .get(`/reader/books/${getReflowableBookId()}/bookmarks`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(listResponse.status).toBe(HttpStatus.OK);
    expect(listResponse.body.total).toBe(2);
    expect(listResponse.body.bookmarks).toHaveLength(2);
    const pagedResponse = await request(getServer())
      .get(`/reader/books/${getReflowableBookId()}/bookmarks`)
      .query({ limit: 1, offset: 0 })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(pagedResponse.body.total).toBe(2);
    expect(pagedResponse.body.bookmarks).toHaveLength(1);
  });

  it('Given a fixed-layout book, When the reader creates a bookmark, Then spread index and page number persist', async () => {
    const actualResponse = await request(getServer())
      .post(`/reader/books/${getFixedBookId()}/bookmarks`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spreadIndex: 1, pageNumber: 3 });
    expect(actualResponse.status).toBe(HttpStatus.CREATED);
    expect(actualResponse.body.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
    expect(actualResponse.body.spreadIndex).toBe(1);
    expect(actualResponse.body.pageNumber).toBe(3);
    expect(actualResponse.body.spineIndex).toBeNull();
    expect(actualResponse.body.scrollOffset).toBeNull();
  });

  it('Given a fixed-layout book, When reflowable fields are bookmarked, Then the position is rejected', async () => {
    const actualResponse = await request(getServer())
      .post(`/reader/books/${getFixedBookId()}/bookmarks`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 2, scrollOffset: 640 });
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('READING_BOOKMARK_INVALID_POSITION');
  });

  it('Given a book without layout, When a bookmark is created, Then the layout is rejected', async () => {
    const actualResponse = await request(getServer())
      .post(`/reader/books/${getUnknownLayoutBookId()}/bookmarks`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 0, scrollOffset: 0 });
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('READING_BOOKMARK_BOOK_LAYOUT_UNKNOWN');
  });

  it('Given another reader, When they list the first reader bookmarks, Then the collection is empty', async () => {
    const actualResponse = await request(getServer())
      .get(`/reader/books/${getReflowableBookId()}/bookmarks`)
      .set('Authorization', `Bearer ${getOtherAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.total).toBe(0);
    expect(actualResponse.body.bookmarks).toHaveLength(0);
  });

  it('Given another reader, When they delete the first reader bookmark, Then it is not found', async () => {
    const actualResponse = await request(getServer())
      .delete(`/reader/books/${getReflowableBookId()}/bookmarks/${getReflowableBookmarkId()}`)
      .set('Authorization', `Bearer ${getOtherAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given the owner, When they delete a bookmark, Then it disappears from the list', async () => {
    const deleteResponse = await request(getServer())
      .delete(`/reader/books/${getReflowableBookId()}/bookmarks/${getReflowableBookmarkId()}`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(deleteResponse.status).toBe(HttpStatus.OK);
    expect(deleteResponse.body.id).toBe(getReflowableBookmarkId());
    const listResponse = await request(getServer())
      .get(`/reader/books/${getReflowableBookId()}/bookmarks`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(listResponse.body.total).toBe(1);
    const remainingBookmarks: Array<{ id: number }> = listResponse.body.bookmarks;
    expect(remainingBookmarks.some((bookmark) => bookmark.id === getReflowableBookmarkId())).toBe(
      false,
    );
  });

  it('Given a missing book, When a bookmark is created, Then the book is not found', async () => {
    const actualResponse = await request(getServer())
      .post('/reader/books/999999/bookmarks')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 0, scrollOffset: 0 });
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
    expect(actualResponse.body.message).toContain('Book');
  });
});
