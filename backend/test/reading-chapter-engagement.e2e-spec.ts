import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookLayoutType, BookType } from '@/modules/book/enum/general.enum';
import { ReadingChapterEngagementService } from '@/modules/reading-intelligence/reading-chapter-engagement.service';
import { ReadingIntelligenceService } from '@/modules/reading-intelligence/reading-intelligence.service';
import { ReadingSessionService } from '@/modules/reading/reading-session.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { assignMonthlySubscription } from './assign-monthly-subscription';
import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';
import { publishTestBook } from './publish-test-book';

describe('Reading chapter engagement (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `reading-chapter-owner-${Date.now()}@book.test`;
  const readerEmail = `reading-chapter-reader-${Date.now()}@book.test`;
  const emails = [ownerEmail, readerEmail];
  const range = {
    startsAt: new Date('2020-01-01T00:00:00.000Z'),
    endsAt: new Date('2030-01-01T00:00:00.000Z'),
  };
  let app: INestApplication | undefined;
  let reflowableBookId: number | undefined;
  let fixedBookId: number | undefined;
  let readerId: number | undefined;
  let readerAccessToken: string | undefined;
  let firstSessionId: number | undefined;
  let secondSessionId: number | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.readingChapterEngagement.deleteMany({
      where: {
        OR: [{ user: { email: { in: emails } } }, { book: { owner: { email: { in: emails } } } }],
      },
    });
    await prismaProviderService.readingSession.deleteMany({
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

  function getReaderId(): number {
    if (readerId === undefined) {
      throw new Error('Reader was not created');
    }
    return readerId;
  }

  function getReaderAccessToken(): string {
    if (readerAccessToken === undefined) {
      throw new Error('Reader access token was not created');
    }
    return readerAccessToken;
  }

  function getFirstSessionId(): number {
    if (firstSessionId === undefined) {
      throw new Error('First session was not created');
    }
    return firstSessionId;
  }

  function getSecondSessionId(): number {
    if (secondSessionId === undefined) {
      throw new Error('Second session was not created');
    }
    return secondSessionId;
  }

  function getChapterEngagementService(): ReadingChapterEngagementService {
    return getRunningApp().get(ReadingChapterEngagementService);
  }

  it('Given a reflowable session, When activity is ingested, Then active time accumulates per chapter and idle is excluded', async () => {
    const ownerRegister = await request(getServer()).post('/auth/register').send({
      email: ownerEmail,
      password,
    });
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${ownerRegister.body.accessToken}`);
    const ownerId = publisherResponse.body.user.id as number;
    const bookService: BookService = getRunningApp().get(BookService);
    const reflowableBook = await bookService.createBook({
      title: 'Chapter Engagement Reflowable Fixture',
      description: 'Used by reading chapter engagement e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
    });
    reflowableBookId = reflowableBook.id;
    const fixedBook = await bookService.createBook({
      title: 'Chapter Engagement Fixed Fixture',
      description: 'Used by reading chapter engagement e2e tests.',
      layoutType: BookLayoutType.FIXED_LAYOUT,
      bookType: BookType.PICTURE_BOOK,
      ownerId,
    });
    fixedBookId = fixedBook.id;
    await publishTestBook(getRunningApp(), reflowableBook.id);
    await publishTestBook(getRunningApp(), fixedBook.id);
    const readerRegister = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    readerId = readerRegister.body.user.id as number;
    readerAccessToken = readerRegister.body.accessToken as string;
    await assignMonthlySubscription(getRunningApp(), getReaderId());
    const startResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 0, scrollOffset: 0 });
    expect(startResponse.status).toBe(HttpStatus.CREATED);
    firstSessionId = startResponse.body.id as number;
    const firstChapterResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions/${getFirstSessionId()}/activity`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        activeDurationMs: 10000,
        idleDurationMs: 0,
        spineIndex: 0,
        scrollOffset: 40,
      });
    expect(firstChapterResponse.status).toBe(HttpStatus.OK);
    const secondChapterResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions/${getFirstSessionId()}/activity`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        activeDurationMs: 15000,
        idleDurationMs: 3000,
        spineIndex: 1,
        scrollOffset: 80,
      });
    expect(secondChapterResponse.status).toBe(HttpStatus.OK);
    expect(secondChapterResponse.body.activeDurationMs).toBe(25000);
    expect(secondChapterResponse.body.idleDurationMs).toBe(3000);
    const sameChapterResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions/${getFirstSessionId()}/activity`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        activeDurationMs: 5000,
        idleDurationMs: 0,
        spineIndex: 0,
        scrollOffset: 120,
      });
    expect(sameChapterResponse.status).toBe(HttpStatus.OK);
    const omittedSpineResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions/${getFirstSessionId()}/activity`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ activeDurationMs: 2000, idleDurationMs: 0 });
    expect(omittedSpineResponse.status).toBe(HttpStatus.OK);
    expect(omittedSpineResponse.body.spineIndex).toBe(0);
    const unknownChapterResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions/${getFirstSessionId()}/activity`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        activeDurationMs: 1000,
        idleDurationMs: 0,
        spineIndex: 99,
        scrollOffset: 0,
      });
    expect(unknownChapterResponse.status).toBe(HttpStatus.OK);
    const firstSessionRows = await getChapterEngagementService().listReadingChapterEngagements({
      userId: getReaderId(),
      bookId: getReflowableBookId(),
      sessionId: getFirstSessionId(),
    });
    expect(firstSessionRows.total).toBe(3);
    expect(
      firstSessionRows.entities.map((row) => ({
        spineIndex: row.spineIndex,
        activeDurationMs: row.activeDurationMs,
      })),
    ).toEqual([
      { spineIndex: 0, activeDurationMs: 17000 },
      { spineIndex: 1, activeDurationMs: 15000 },
      { spineIndex: 99, activeDurationMs: 1000 },
    ]);
    const endResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions/${getFirstSessionId()}/end`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ activeDurationMs: 4000, idleDurationMs: 500, spineIndex: 1, scrollOffset: 10 });
    expect(endResponse.status).toBe(HttpStatus.OK);
    const endedRows = await getChapterEngagementService().listReadingChapterEngagements({
      userId: getReaderId(),
      bookId: getReflowableBookId(),
      sessionId: getFirstSessionId(),
    });
    expect(endedRows.entities.find((row) => row.spineIndex === 1)?.activeDurationMs).toBe(19000);
  });

  it('Given a second session, When activity is ingested, Then chapter totals aggregate across sessions', async () => {
    const startResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 0, scrollOffset: 0 });
    expect(startResponse.status).toBe(HttpStatus.CREATED);
    secondSessionId = startResponse.body.id as number;
    const activityResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions/${getSecondSessionId()}/activity`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        activeDurationMs: 8000,
        idleDurationMs: 2000,
        spineIndex: 0,
        scrollOffset: 20,
      });
    expect(activityResponse.status).toBe(HttpStatus.OK);
    const secondSessionRows = await getChapterEngagementService().listReadingChapterEngagements({
      userId: getReaderId(),
      bookId: getReflowableBookId(),
      sessionId: getSecondSessionId(),
    });
    expect(secondSessionRows.entities).toEqual([
      expect.objectContaining({ spineIndex: 0, activeDurationMs: 8000 }),
    ]);
    const chapterTotals = await getChapterEngagementService().sumDurationsByChapterInRange({
      bookId: getReflowableBookId(),
      ...range,
    });
    expect(chapterTotals).toEqual([
      { spineIndex: 0, activeDurationMs: 25000 },
      { spineIndex: 1, activeDurationMs: 19000 },
      { spineIndex: 99, activeDurationMs: 1000 },
    ]);
  });

  it('Given extra session-only activity, When book engagement is listed, Then monetization still uses session active time', async () => {
    await getRunningApp().get(ReadingSessionService).recordReadingSessionActivity({
      id: getSecondSessionId(),
      userId: getReaderId(),
      bookId: getReflowableBookId(),
      activeDurationMs: 5000,
      idleDurationMs: 0,
    });
    const chapterTotals = await getChapterEngagementService().sumDurationsByChapterInRange({
      bookId: getReflowableBookId(),
      ...range,
    });
    const chapterActiveMs = chapterTotals.reduce((sum, row) => sum + row.activeDurationMs, 0);
    expect(chapterActiveMs).toBe(45000);
    const signals = await getRunningApp()
      .get(ReadingIntelligenceService)
      .listBookEngagementSignalsInRange(range);
    const reflowableSignal = signals.find((signal) => signal.bookId === getReflowableBookId());
    expect(reflowableSignal?.activeDurationMs).toBe(50000);
    expect(reflowableSignal?.activeDurationMs).toBeGreaterThan(chapterActiveMs);
  });

  it('Given a fixed-layout session, When activity is ingested, Then no chapter rows are written', async () => {
    const startResponse = await request(getServer())
      .post(`/reader/books/${getFixedBookId()}/sessions`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spreadIndex: 0, pageNumber: 1 });
    expect(startResponse.status).toBe(HttpStatus.CREATED);
    const fixedSessionId = startResponse.body.id as number;
    const activityResponse = await request(getServer())
      .post(`/reader/books/${getFixedBookId()}/sessions/${fixedSessionId}/activity`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        activeDurationMs: 12000,
        idleDurationMs: 0,
        spreadIndex: 0,
        pageNumber: 1,
      });
    expect(activityResponse.status).toBe(HttpStatus.OK);
    const fixedRows = await getChapterEngagementService().listReadingChapterEngagements({
      userId: getReaderId(),
      bookId: getFixedBookId(),
      sessionId: fixedSessionId,
    });
    expect(fixedRows.total).toBe(0);
    const fixedChapterTotals = await getChapterEngagementService().sumDurationsByChapterInRange({
      bookId: getFixedBookId(),
      ...range,
    });
    expect(fixedChapterTotals).toEqual([]);
  });
});
