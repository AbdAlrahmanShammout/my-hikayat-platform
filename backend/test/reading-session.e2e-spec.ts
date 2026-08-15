import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookLayoutType, BookType } from '@/modules/book/enum/general.enum';
import { ReadingSessionAlreadyEndedException } from '@/modules/reading/exceptions/reading-session-already-ended.exception';
import { ReadingSessionAlreadyOpenException } from '@/modules/reading/exceptions/reading-session-already-open.exception';
import { ReadingSessionBookLayoutUnknownException } from '@/modules/reading/exceptions/reading-session-book-layout-unknown.exception';
import { ReadingSessionInvalidPositionException } from '@/modules/reading/exceptions/reading-session-invalid-position.exception';
import { ReadingSessionService } from '@/modules/reading/reading-session.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { assignMonthlySubscription } from './assign-monthly-subscription';
import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Reading session (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `reading-session-${Date.now()}@book.test`;
  let app: INestApplication | undefined;
  let userId: number | undefined;
  let reflowableBookId: number | undefined;
  let fixedBookId: number | undefined;
  let unknownLayoutBookId: number | undefined;
  let reflowableSessionId: number | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.readingSession.deleteMany({
      where: { user: { email: ownerEmail } },
    });
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: ownerEmail } },
    });
    await prismaProviderService.subscription.deleteMany({
      where: { user: { email: ownerEmail } },
    });
    await deleteUsersByEmail(prismaProviderService, ownerEmail);
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

  function getUserId(): number {
    if (userId === undefined) {
      throw new Error('User was not created');
    }
    return userId;
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

  function getReflowableSessionId(): number {
    if (reflowableSessionId === undefined) {
      throw new Error('Reflowable session was not created');
    }
    return reflowableSessionId;
  }

  it('Given a reflowable book, When a session starts, Then it is open with zero durations', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: ownerEmail,
      password,
    });
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);
    userId = publisherResponse.body.user.id as number;
    await assignMonthlySubscription(getRunningApp(), userId);
    const bookService: BookService = getRunningApp().get(BookService);
    const reflowableBook = await bookService.createBook({
      title: 'Reflowable Session Fixture',
      description: 'Used by reading-session e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: getUserId(),
    });
    reflowableBookId = reflowableBook.id;
    const fixedBook = await bookService.createBook({
      title: 'Fixed Session Fixture',
      description: 'Used by reading-session e2e tests.',
      layoutType: BookLayoutType.FIXED_LAYOUT,
      bookType: BookType.PICTURE_BOOK,
      ownerId: getUserId(),
    });
    fixedBookId = fixedBook.id;
    const unknownLayoutBook = await bookService.createBook({
      title: 'Unknown Layout Session Fixture',
      description: 'Used by reading-session e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: getUserId(),
    });
    unknownLayoutBookId = unknownLayoutBook.id;
    const startedAt = new Date('2026-08-15T02:00:00.000Z');
    const actualSession = await getRunningApp().get(ReadingSessionService).startReadingSession({
      userId: getUserId(),
      bookId: reflowableBook.id,
      spineIndex: 2,
      scrollOffset: 640,
      startedAt,
    });
    expect(actualSession.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualSession.startedAt).toEqual(startedAt);
    expect(actualSession.endedAt).toBeNull();
    expect(actualSession.activeDurationMs).toBe(0);
    expect(actualSession.idleDurationMs).toBe(0);
    expect(actualSession.spineIndex).toBe(2);
    expect(actualSession.scrollOffset).toBe(640);
    expect(actualSession.spreadIndex).toBeNull();
    reflowableSessionId = actualSession.id;
  });

  it('Given an open reflowable session, When another starts, Then the second start is rejected', async () => {
    await expect(
      getRunningApp().get(ReadingSessionService).startReadingSession({
        userId: getUserId(),
        bookId: getReflowableBookId(),
        spineIndex: 3,
        scrollOffset: 10,
      }),
    ).rejects.toBeInstanceOf(ReadingSessionAlreadyOpenException);
  });

  it('Given an open reflowable session, When it ends, Then active and idle durations persist', async () => {
    const endedAt = new Date('2026-08-15T02:20:00.000Z');
    const actualSession = await getRunningApp().get(ReadingSessionService).endReadingSession({
      id: getReflowableSessionId(),
      userId: getUserId(),
      bookId: getReflowableBookId(),
      endedAt,
      activeDurationMs: 900_000,
      idleDurationMs: 120_000,
      spineIndex: 4,
      scrollOffset: 80,
    });
    expect(actualSession.id).toBe(getReflowableSessionId());
    expect(actualSession.endedAt).toEqual(endedAt);
    expect(actualSession.activeDurationMs).toBe(900_000);
    expect(actualSession.idleDurationMs).toBe(120_000);
    expect(actualSession.spineIndex).toBe(4);
    expect(actualSession.scrollOffset).toBe(80);
    const storedSession = await getRunningApp()
      .get(ReadingSessionService)
      .getReadingSessionById(getReflowableSessionId());
    expect(storedSession.endedAt).toEqual(endedAt);
  });

  it('Given an ended session, When it is ended again, Then the end is rejected', async () => {
    await expect(
      getRunningApp().get(ReadingSessionService).endReadingSession({
        id: getReflowableSessionId(),
        userId: getUserId(),
        bookId: getReflowableBookId(),
        activeDurationMs: 1,
        idleDurationMs: 0,
      }),
    ).rejects.toBeInstanceOf(ReadingSessionAlreadyEndedException);
  });

  it('Given a fixed-layout book, When a session starts, Then spread index and page number persist', async () => {
    const actualSession = await getRunningApp().get(ReadingSessionService).startReadingSession({
      userId: getUserId(),
      bookId: getFixedBookId(),
      spreadIndex: 1,
      pageNumber: 3,
    });
    expect(actualSession.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
    expect(actualSession.spreadIndex).toBe(1);
    expect(actualSession.pageNumber).toBe(3);
    expect(actualSession.spineIndex).toBeNull();
    expect(actualSession.endedAt).toBeNull();
  });

  it('Given a reflowable book, When a fixed-layout position is used, Then the position is rejected', async () => {
    await expect(
      getRunningApp().get(ReadingSessionService).startReadingSession({
        userId: getUserId(),
        bookId: getReflowableBookId(),
        spreadIndex: 0,
        pageNumber: 1,
      }),
    ).rejects.toBeInstanceOf(ReadingSessionInvalidPositionException);
  });

  it('Given a book without layout, When a session starts, Then the layout is rejected', async () => {
    await expect(
      getRunningApp().get(ReadingSessionService).startReadingSession({
        userId: getUserId(),
        bookId: getUnknownLayoutBookId(),
        spineIndex: 0,
        scrollOffset: 0,
      }),
    ).rejects.toBeInstanceOf(ReadingSessionBookLayoutUnknownException);
  });
});
