import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookLayoutType, BookType } from '@/modules/book/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';

describe('Reading intelligence ingest (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `reading-intelligence-owner-${Date.now()}@book.test`;
  const readerEmail = `reading-intelligence-reader-${Date.now()}@book.test`;
  const otherEmail = `reading-intelligence-other-${Date.now()}@book.test`;
  const emails = [ownerEmail, readerEmail, otherEmail];
  let app: INestApplication | undefined;
  let reflowableBookId: number | undefined;
  let readerAccessToken: string | undefined;
  let otherAccessToken: string | undefined;
  let sessionId: number | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.readingSession.deleteMany({
      where: {
        OR: [{ user: { email: { in: emails } } }, { book: { owner: { email: { in: emails } } } }],
      },
    });
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: { in: emails } } },
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

  function getSessionId(): number {
    if (sessionId === undefined) {
      throw new Error('Reading session was not created');
    }
    return sessionId;
  }

  async function registerUser(email: string): Promise<string> {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    return registerResponse.body.accessToken as string;
  }

  it('Given no access token, When a session is started, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).post('/reader/books/1/sessions').send({
      spineIndex: 0,
      scrollOffset: 0,
    });
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given a reflowable book, When the reader starts a session, Then it is open with zero durations', async () => {
    const ownerToken = await registerUser(ownerEmail);
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${ownerToken}`);
    const ownerId = publisherResponse.body.user.id as number;
    const bookService: BookService = getRunningApp().get(BookService);
    const reflowableBook = await bookService.createBook({
      title: 'Intelligence Ingest Fixture',
      description: 'Used by reading-intelligence e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
    });
    reflowableBookId = reflowableBook.id;
    readerAccessToken = await registerUser(readerEmail);
    otherAccessToken = await registerUser(otherEmail);
    const actualResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 2, scrollOffset: 640 });
    expect(actualResponse.status).toBe(HttpStatus.CREATED);
    expect(actualResponse.body.bookId).toBe(getReflowableBookId());
    expect(actualResponse.body.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualResponse.body.endedAt).toBeNull();
    expect(actualResponse.body.activeDurationMs).toBe(0);
    expect(actualResponse.body.idleDurationMs).toBe(0);
    expect(actualResponse.body.spineIndex).toBe(2);
    sessionId = actualResponse.body.id as number;
  });

  it('Given an open session, When activity is ingested, Then active and idle totals accumulate', async () => {
    const actualResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions/${getSessionId()}/activity`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        activeDurationMs: 15000,
        idleDurationMs: 3000,
        spineIndex: 3,
        scrollOffset: 80,
      });
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.id).toBe(getSessionId());
    expect(actualResponse.body.activeDurationMs).toBe(15000);
    expect(actualResponse.body.idleDurationMs).toBe(3000);
    expect(actualResponse.body.spineIndex).toBe(3);
    expect(actualResponse.body.scrollOffset).toBe(80);
    const secondResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions/${getSessionId()}/activity`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ activeDurationMs: 5000, idleDurationMs: 1000 });
    expect(secondResponse.body.activeDurationMs).toBe(20000);
    expect(secondResponse.body.idleDurationMs).toBe(4000);
    expect(secondResponse.body.spineIndex).toBe(3);
  });

  it('Given an open session, When current is loaded, Then the open session is returned', async () => {
    const actualResponse = await request(getServer())
      .get(`/reader/books/${getReflowableBookId()}/sessions/current`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.id).toBe(getSessionId());
    expect(actualResponse.body.endedAt).toBeNull();
    expect(actualResponse.body.activeDurationMs).toBe(20000);
  });

  it('Given another reader, When they ingest activity, Then the session is not found', async () => {
    const actualResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions/${getSessionId()}/activity`)
      .set('Authorization', `Bearer ${getOtherAccessToken()}`)
      .send({ activeDurationMs: 1, idleDurationMs: 0 });
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given an open session, When a second session starts, Then the start is rejected', async () => {
    const actualResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 0, scrollOffset: 0 });
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('READING_SESSION_ALREADY_OPEN');
  });

  it('Given an open session, When it ends with a final interval, Then durations are accumulated and endedAt is set', async () => {
    const actualResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions/${getSessionId()}/end`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ activeDurationMs: 2000, idleDurationMs: 500, spineIndex: 4, scrollOffset: 10 });
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.id).toBe(getSessionId());
    expect(actualResponse.body.endedAt).toEqual(expect.any(String));
    expect(actualResponse.body.activeDurationMs).toBe(22000);
    expect(actualResponse.body.idleDurationMs).toBe(4500);
    expect(actualResponse.body.spineIndex).toBe(4);
  });

  it('Given an ended session, When activity is ingested, Then the ingest is rejected', async () => {
    const actualResponse = await request(getServer())
      .post(`/reader/books/${getReflowableBookId()}/sessions/${getSessionId()}/activity`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ activeDurationMs: 1, idleDurationMs: 0 });
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('READING_SESSION_ALREADY_ENDED');
  });

  it('Given no open session, When current is loaded, Then the session is not found', async () => {
    const actualResponse = await request(getServer())
      .get(`/reader/books/${getReflowableBookId()}/sessions/current`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });
});
