import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookLayoutType, BookType } from '@/modules/book/enum/general.enum';
import { ReadingProgressBookLayoutUnknownException } from '@/modules/reading/exceptions/reading-progress-book-layout-unknown.exception';
import { ReadingProgressInvalidPositionException } from '@/modules/reading/exceptions/reading-progress-invalid-position.exception';
import { ReadingProgressService } from '@/modules/reading/reading-progress.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { assignMonthlySubscription } from './assign-monthly-subscription';
import { createTestingApp } from './create-testing-app';

describe('Reading progress (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `reading-progress-${Date.now()}@book.test`;
  let app: INestApplication | undefined;
  let userId: number | undefined;
  let reflowableBookId: number | undefined;
  let fixedBookId: number | undefined;
  let unknownLayoutBookId: number | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.readingProgress.deleteMany({
      where: { user: { email: ownerEmail } },
    });
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: ownerEmail } },
    });
    await prismaProviderService.subscription.deleteMany({
      where: { user: { email: ownerEmail } },
    });
    await prismaProviderService.user.deleteMany({ where: { email: ownerEmail } });
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

  it('Given a reflowable book, When progress is saved, Then spine index and scroll offset persist', async () => {
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
      title: 'Reflowable Progress Fixture',
      description: 'Used by reading-progress e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: getUserId(),
    });
    reflowableBookId = reflowableBook.id;
    const fixedBook = await bookService.createBook({
      title: 'Fixed Progress Fixture',
      description: 'Used by reading-progress e2e tests.',
      layoutType: BookLayoutType.FIXED_LAYOUT,
      bookType: BookType.PICTURE_BOOK,
      ownerId: getUserId(),
    });
    fixedBookId = fixedBook.id;
    const unknownLayoutBook = await bookService.createBook({
      title: 'Unknown Layout Fixture',
      description: 'Used by reading-progress e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: getUserId(),
    });
    unknownLayoutBookId = unknownLayoutBook.id;
    const lastSessionAt = new Date('2026-08-15T02:00:00.000Z');
    const actualProgress = await getRunningApp().get(ReadingProgressService).saveReadingProgress({
      userId: getUserId(),
      bookId: reflowableBook.id,
      spineIndex: 2,
      scrollOffset: 640,
      lastSessionAt,
    });
    expect(actualProgress.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualProgress.spineIndex).toBe(2);
    expect(actualProgress.scrollOffset).toBe(640);
    expect(actualProgress.spreadIndex).toBeNull();
    expect(actualProgress.pageNumber).toBeNull();
    expect(actualProgress.lastSessionAt).toEqual(lastSessionAt);
  });

  it('Given a fixed-layout book, When progress is saved, Then spread index and page number persist', async () => {
    if (fixedBookId === undefined) {
      throw new Error('Fixed-layout book was not created');
    }
    const actualProgress = await getRunningApp().get(ReadingProgressService).saveReadingProgress({
      userId: getUserId(),
      bookId: fixedBookId,
      spreadIndex: 1,
      pageNumber: 3,
    });
    expect(actualProgress.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
    expect(actualProgress.spreadIndex).toBe(1);
    expect(actualProgress.pageNumber).toBe(3);
    expect(actualProgress.spineIndex).toBeNull();
    expect(actualProgress.scrollOffset).toBeNull();
    const storedProgress = await getRunningApp()
      .get(ReadingProgressService)
      .getReadingProgressByUserAndBook({
        userId: getUserId(),
        bookId: fixedBookId,
      });
    expect(storedProgress.id).toBe(actualProgress.id);
    expect(storedProgress.pageNumber).toBe(3);
  });

  it('Given a reflowable book, When fixed-layout fields are saved, Then the position is rejected', async () => {
    if (reflowableBookId === undefined) {
      throw new Error('Reflowable book was not created');
    }
    await expect(
      getRunningApp().get(ReadingProgressService).saveReadingProgress({
        userId: getUserId(),
        bookId: reflowableBookId,
        spreadIndex: 0,
        pageNumber: 1,
      }),
    ).rejects.toBeInstanceOf(ReadingProgressInvalidPositionException);
  });

  it('Given a book without layout, When progress is saved, Then the layout is rejected', async () => {
    if (unknownLayoutBookId === undefined) {
      throw new Error('Unknown-layout book was not created');
    }
    await expect(
      getRunningApp().get(ReadingProgressService).saveReadingProgress({
        userId: getUserId(),
        bookId: unknownLayoutBookId,
        spineIndex: 0,
        scrollOffset: 0,
      }),
    ).rejects.toBeInstanceOf(ReadingProgressBookLayoutUnknownException);
  });
});
