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

describe('Reading visual engagement (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `reading-visual-owner-${Date.now()}@book.test`;
  const readerEmail = `reading-visual-reader-${Date.now()}@book.test`;
  const otherEmail = `reading-visual-other-${Date.now()}@book.test`;
  const emails = [ownerEmail, readerEmail, otherEmail];
  let app: INestApplication | undefined;
  let reflowableBookId: number | undefined;
  let fixedBookId: number | undefined;
  let readerAccessToken: string | undefined;
  let otherAccessToken: string | undefined;
  let reflowableSessionId: number | undefined;
  let fixedSessionId: number | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.readingVisualEngagement.deleteMany({
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

  function getReflowableSessionId(): number {
    if (reflowableSessionId === undefined) {
      throw new Error('Reflowable session was not created');
    }
    return reflowableSessionId;
  }

  function getFixedSessionId(): number {
    if (fixedSessionId === undefined) {
      throw new Error('Fixed-layout session was not created');
    }
    return fixedSessionId;
  }

  async function registerUser(email: string): Promise<string> {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    await assignMonthlySubscription(getRunningApp(), registerResponse.body.user.id as number);
    return registerResponse.body.accessToken as string;
  }

  it('Given no access token, When visual engagement is ingested, Then authentication fails', async () => {
    const actualResponse = await request(getServer())
      .post('/reader/books/1/sessions/1/visual-engagement')
      .send({
        spreadIndex: 1,
        pageNumber: 3,
        activeDurationMs: 1000,
        visualSceneTimeMs: 800,
      });
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given a reflowable session, When visual engagement is ingested, Then the ingest is rejected', async () => {
    const ownerToken = await registerUser(ownerEmail);
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${ownerToken}`);
    const ownerId = publisherResponse.body.user.id as number;
    const bookService: BookService = getRunningApp().get(BookService);
    const reflowableBook = await bookService.createBook({
      title: 'Visual Engagement Reflowable Fixture',
      description: 'Used by reading visual engagement e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
    });
    reflowableBookId = reflowableBook.id;
    const fixedBook = await bookService.createBook({
      title: 'Visual Engagement Fixed Fixture',
      description: 'Used by reading visual engagement e2e tests.',
      layoutType: BookLayoutType.FIXED_LAYOUT,
      bookType: BookType.PICTURE_BOOK,
      ownerId,
    });
    fixedBookId = fixedBook.id;
    await publishTestBook(getRunningApp(), reflowableBook.id);
    await publishTestBook(getRunningApp(), fixedBook.id);
    readerAccessToken = await registerUser(readerEmail);
    otherAccessToken = await registerUser(otherEmail);
    const startResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 0, scrollOffset: 0 });
    expect(startResponse.status).toBe(HttpStatus.CREATED);
    reflowableSessionId = startResponse.body.id as number;
    const actualResponse = await request(getServer())
      .post(
        `/reader/books/${getReflowableBookId()}/sessions/${getReflowableSessionId()}/visual-engagement`,
      )
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        spreadIndex: 1,
        pageNumber: 3,
        activeDurationMs: 15000,
        visualSceneTimeMs: 12000,
      });
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('READING_VISUAL_ENGAGEMENT_NOT_FIXED_LAYOUT');
  });

  it('Given a fixed-layout session, When visual engagement is ingested twice, Then durations accumulate', async () => {
    const startResponse = await request(getServer())
      .post(`/reader/books/${getFixedBookId()}/sessions`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spreadIndex: 1, pageNumber: 3 });
    expect(startResponse.status).toBe(HttpStatus.CREATED);
    fixedSessionId = startResponse.body.id as number;
    const firstResponse = await request(getServer())
      .post(`/reader/books/${getFixedBookId()}/sessions/${getFixedSessionId()}/visual-engagement`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        spreadIndex: 1,
        pageNumber: 3,
        activeDurationMs: 15000,
        visualSceneTimeMs: 12000,
      });
    expect(firstResponse.status).toBe(HttpStatus.OK);
    expect(firstResponse.body.sessionId).toBe(getFixedSessionId());
    expect(firstResponse.body.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
    expect(firstResponse.body.spreadIndex).toBe(1);
    expect(firstResponse.body.pageNumber).toBe(3);
    expect(firstResponse.body.activeDurationMs).toBe(15000);
    expect(firstResponse.body.visualSceneTimeMs).toBe(12000);
    const secondResponse = await request(getServer())
      .post(`/reader/books/${getFixedBookId()}/sessions/${getFixedSessionId()}/visual-engagement`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        spreadIndex: 1,
        pageNumber: 3,
        activeDurationMs: 5000,
        visualSceneTimeMs: 4000,
      });
    expect(secondResponse.status).toBe(HttpStatus.OK);
    expect(secondResponse.body.activeDurationMs).toBe(20000);
    expect(secondResponse.body.visualSceneTimeMs).toBe(16000);
  });

  it('Given a different spread, When visual engagement is ingested, Then a second row is created', async () => {
    const ingestResponse = await request(getServer())
      .post(`/reader/books/${getFixedBookId()}/sessions/${getFixedSessionId()}/visual-engagement`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        spreadIndex: 2,
        pageNumber: 5,
        activeDurationMs: 8000,
        visualSceneTimeMs: 7000,
      });
    expect(ingestResponse.status).toBe(HttpStatus.OK);
    expect(ingestResponse.body.spreadIndex).toBe(2);
    expect(ingestResponse.body.pageNumber).toBe(5);
    expect(ingestResponse.body.activeDurationMs).toBe(8000);
    const listResponse = await request(getServer())
      .get(`/reader/books/${getFixedBookId()}/sessions/${getFixedSessionId()}/visual-engagement`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(listResponse.status).toBe(HttpStatus.OK);
    expect(listResponse.body.total).toBe(2);
    expect(listResponse.body.visualEngagements).toHaveLength(2);
    expect(listResponse.body.visualEngagements[0].spreadIndex).toBe(1);
    expect(listResponse.body.visualEngagements[1].spreadIndex).toBe(2);
  });

  it('Given another reader, When they ingest visual engagement, Then the session is not found', async () => {
    const actualResponse = await request(getServer())
      .post(`/reader/books/${getFixedBookId()}/sessions/${getFixedSessionId()}/visual-engagement`)
      .set('Authorization', `Bearer ${getOtherAccessToken()}`)
      .send({
        spreadIndex: 1,
        pageNumber: 3,
        activeDurationMs: 1,
        visualSceneTimeMs: 1,
      });
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given an invalid page number, When visual engagement is ingested, Then validation fails', async () => {
    const actualResponse = await request(getServer())
      .post(`/reader/books/${getFixedBookId()}/sessions/${getFixedSessionId()}/visual-engagement`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        spreadIndex: 1,
        pageNumber: 0,
        activeDurationMs: 1000,
        visualSceneTimeMs: 800,
      });
    expect(actualResponse.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  it('Given an ended session, When visual engagement is ingested, Then the ingest is rejected', async () => {
    const endResponse = await request(getServer())
      .post(`/reader/books/${getFixedBookId()}/sessions/${getFixedSessionId()}/end`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({});
    expect(endResponse.status).toBe(HttpStatus.OK);
    const actualResponse = await request(getServer())
      .post(`/reader/books/${getFixedBookId()}/sessions/${getFixedSessionId()}/visual-engagement`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        spreadIndex: 1,
        pageNumber: 3,
        activeDurationMs: 1000,
        visualSceneTimeMs: 800,
      });
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('READING_SESSION_ALREADY_ENDED');
  });

  it('Given an ended session, When visual engagement is listed, Then the accumulated rows remain', async () => {
    const actualResponse = await request(getServer())
      .get(`/reader/books/${getFixedBookId()}/sessions/${getFixedSessionId()}/visual-engagement`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.total).toBe(2);
    expect(actualResponse.body.visualEngagements[0].activeDurationMs).toBe(20000);
    expect(actualResponse.body.visualEngagements[0].visualSceneTimeMs).toBe(16000);
  });
});
