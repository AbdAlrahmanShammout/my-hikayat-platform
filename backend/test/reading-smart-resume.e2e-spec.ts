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
import { publishTestBook } from './publish-test-book';

describe('Reading Smart Resume (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `smart-resume-owner-${Date.now()}@book.test`;
  const readerEmail = `smart-resume-reader-${Date.now()}@book.test`;
  const otherEmail = `smart-resume-other-${Date.now()}@book.test`;
  const emails = [ownerEmail, readerEmail, otherEmail];
  let app: INestApplication | undefined;
  let reflowableBookId: number | undefined;
  let fixedBookId: number | undefined;
  let unreadBookId: number | undefined;
  let unknownLayoutBookId: number | undefined;
  let readerAccessToken: string | undefined;
  let otherAccessToken: string | undefined;
  let savedProgressId: number | undefined;

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

  function getUnreadBookId(): number {
    if (unreadBookId === undefined) {
      throw new Error('Unread book was not created');
    }
    return unreadBookId;
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

  function getSavedProgressId(): number {
    if (savedProgressId === undefined) {
      throw new Error('Reading progress was not saved');
    }
    return savedProgressId;
  }

  async function registerUser(email: string): Promise<string> {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    await assignMonthlySubscription(getRunningApp(), registerResponse.body.user.id as number);
    return registerResponse.body.accessToken as string;
  }

  it('Given no access token, When Smart Resume is saved or loaded, Then authentication fails', async () => {
    const putResponse = await request(getServer()).put('/reader/books/1/progress').send({
      spineIndex: 0,
      scrollOffset: 0,
    });
    const getResponse = await request(getServer()).get('/reader/books/1/progress');
    expect(putResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(putResponse.body.code).toBe('AUTHENTICATION_FAILED');
    expect(getResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(getResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given a reflowable book, When the reader saves progress, Then spine index and scroll offset are returned', async () => {
    const ownerToken = await registerUser(ownerEmail);
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${ownerToken}`);
    const ownerId = publisherResponse.body.user.id as number;
    const bookService: BookService = getRunningApp().get(BookService);
    const reflowableBook = await bookService.createBook({
      title: 'Reflowable Resume Fixture',
      description: 'Used by Smart Resume e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
    });
    reflowableBookId = reflowableBook.id;
    const fixedBook = await bookService.createBook({
      title: 'Fixed Resume Fixture',
      description: 'Used by Smart Resume e2e tests.',
      layoutType: BookLayoutType.FIXED_LAYOUT,
      bookType: BookType.PICTURE_BOOK,
      ownerId,
    });
    fixedBookId = fixedBook.id;
    const unreadBook = await bookService.createBook({
      title: 'Unread Resume Fixture',
      description: 'Used by Smart Resume e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
    });
    unreadBookId = unreadBook.id;
    const unknownLayoutBook = await bookService.createBook({
      title: 'Unknown Layout Resume Fixture',
      description: 'Used by Smart Resume e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
    });
    unknownLayoutBookId = unknownLayoutBook.id;
    await publishTestBook(getRunningApp(), reflowableBook.id);
    await publishTestBook(getRunningApp(), fixedBook.id);
    await publishTestBook(getRunningApp(), unreadBook.id);
    await publishTestBook(getRunningApp(), unknownLayoutBook.id);
    readerAccessToken = await registerUser(readerEmail);
    otherAccessToken = await registerUser(otherEmail);
    const actualResponse = await request(getServer())
      .put(`/reader/books/${getReflowableBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 2, scrollOffset: 640 });
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.bookId).toBe(getReflowableBookId());
    expect(actualResponse.body.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualResponse.body.spineIndex).toBe(2);
    expect(actualResponse.body.scrollOffset).toBe(640);
    expect(actualResponse.body.spreadIndex).toBeNull();
    expect(actualResponse.body.pageNumber).toBeNull();
    expect(actualResponse.body.lastSessionAt).toEqual(expect.any(String));
    savedProgressId = actualResponse.body.id as number;
  });

  it('Given saved reflowable progress, When the reader loads it, Then the same position is returned', async () => {
    const actualResponse = await request(getServer())
      .get(`/reader/books/${getReflowableBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.id).toBe(getSavedProgressId());
    expect(actualResponse.body.spineIndex).toBe(2);
    expect(actualResponse.body.scrollOffset).toBe(640);
    expect(actualResponse.body.spreadIndex).toBeNull();
    expect(actualResponse.body.pageNumber).toBeNull();
  });

  it('Given existing progress, When the reader saves again, Then the same row is updated', async () => {
    const actualResponse = await request(getServer())
      .put(`/reader/books/${getReflowableBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 4, scrollOffset: 80 });
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.id).toBe(getSavedProgressId());
    expect(actualResponse.body.spineIndex).toBe(4);
    expect(actualResponse.body.scrollOffset).toBe(80);
    const loadedResponse = await request(getServer())
      .get(`/reader/books/${getReflowableBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(loadedResponse.body.spineIndex).toBe(4);
    expect(loadedResponse.body.scrollOffset).toBe(80);
  });

  it('Given a fixed-layout book, When the reader saves progress, Then spread index and page number persist', async () => {
    const actualResponse = await request(getServer())
      .put(`/reader/books/${getFixedBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spreadIndex: 1, pageNumber: 3 });
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
    expect(actualResponse.body.spreadIndex).toBe(1);
    expect(actualResponse.body.pageNumber).toBe(3);
    expect(actualResponse.body.spineIndex).toBeNull();
    expect(actualResponse.body.scrollOffset).toBeNull();
  });

  it('Given a fixed-layout book, When reflowable fields are saved, Then the position is rejected', async () => {
    const actualResponse = await request(getServer())
      .put(`/reader/books/${getFixedBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 2, scrollOffset: 640 });
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('READING_PROGRESS_INVALID_POSITION');
  });

  it('Given a book without layout, When progress is saved, Then the layout is rejected', async () => {
    const actualResponse = await request(getServer())
      .put(`/reader/books/${getUnknownLayoutBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 0, scrollOffset: 0 });
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('READING_PROGRESS_BOOK_LAYOUT_UNKNOWN');
  });

  it('Given a book with no saved progress, When the reader loads it, Then progress is not found', async () => {
    const actualResponse = await request(getServer())
      .get(`/reader/books/${getUnreadBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given another reader, When they load the first reader progress, Then progress is not found', async () => {
    const actualResponse = await request(getServer())
      .get(`/reader/books/${getReflowableBookId()}/progress`)
      .set('Authorization', `Bearer ${getOtherAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given a missing book, When progress is saved or loaded, Then the book is not found', async () => {
    const putResponse = await request(getServer())
      .put('/reader/books/999999/progress')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 0, scrollOffset: 0 });
    const getResponse = await request(getServer())
      .get('/reader/books/999999/progress')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(putResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(putResponse.body.code).toBe('RESOURCE_NOT_FOUND');
    expect(putResponse.body.message).toContain('Book');
    expect(getResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(getResponse.body.code).toBe('RESOURCE_NOT_FOUND');
    expect(getResponse.body.message).toContain('Book');
  });
});
