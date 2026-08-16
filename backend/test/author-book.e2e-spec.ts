import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookPublishingStatus, BookType } from '@/modules/book/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Author books (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `author-book-owner-${Date.now()}@book.test`;
  const otherEmail = `author-book-other-${Date.now()}@book.test`;
  const readerEmail = `author-book-reader-${Date.now()}@book.test`;
  const emails = [ownerEmail, otherEmail, readerEmail];
  let app: INestApplication | undefined;
  let ownerAccessToken: string | undefined;
  let otherAccessToken: string | undefined;
  let bookId: number | undefined;
  let otherBookId: number | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: { in: emails } } },
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

  function getOwnerAccessToken(): string {
    if (ownerAccessToken === undefined) {
      throw new Error('Owner access token was not created');
    }
    return ownerAccessToken;
  }

  function getOtherAccessToken(): string {
    if (otherAccessToken === undefined) {
      throw new Error('Other access token was not created');
    }
    return otherAccessToken;
  }

  function getBookId(): number {
    if (bookId === undefined) {
      throw new Error('Book was not created');
    }
    return bookId;
  }

  function getOtherBookId(): number {
    if (otherBookId === undefined) {
      throw new Error('Other book was not created');
    }
    return otherBookId;
  }

  async function registerPublisher(email: string): Promise<string> {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);
    return publisherResponse.body.accessToken as string;
  }

  it('Given no access token, When a book is created, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).post('/author/books').send({
      title: 'Harbor Lights',
      description: 'A reflowable chapter book.',
      bookType: BookType.STANDARD_CHAPTER,
    });
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given a reader session, When a book is created, Then access is denied', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    const actualResponse = await request(getServer())
      .post('/author/books')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .send({
        title: 'Harbor Lights',
        description: 'A reflowable chapter book.',
        bookType: BookType.STANDARD_CHAPTER,
      });
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('ACCESS_DENIED');
  });

  it('Given a publisher session, When a book is created with an empty title, Then validation fails', async () => {
    ownerAccessToken = await registerPublisher(ownerEmail);
    const actualResponse = await request(getServer())
      .post('/author/books')
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`)
      .send({
        title: '   ',
        description: 'A reflowable chapter book.',
        bookType: BookType.STANDARD_CHAPTER,
      });
    expect(actualResponse.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(actualResponse.body.code).toBe('BAD_USER_INPUT');
  });

  it('Given a publisher session, When a book is created, Then it is pending and owned by the caller', async () => {
    const actualResponse = await request(getServer())
      .post('/author/books')
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`)
      .send({
        title: '  The   Last Lighthouse ',
        description: '  A reflowable chapter book.  ',
        bookType: BookType.STANDARD_CHAPTER,
        ownerId: 99,
        publishingStatus: BookPublishingStatus.APPROVED,
      });
    expect(actualResponse.status).toBe(HttpStatus.CREATED);
    expect(actualResponse.body.title).toBe('The Last Lighthouse');
    expect(actualResponse.body.description).toBe('A reflowable chapter book.');
    expect(actualResponse.body.bookType).toBe(BookType.STANDARD_CHAPTER);
    expect(actualResponse.body.publishingStatus).toBe(BookPublishingStatus.PENDING);
    expect(actualResponse.body.publishedAt).toBeNull();
    expect(actualResponse.body.ownerId).toBeDefined();
    bookId = actualResponse.body.id as number;
  });

  it('Given a publisher session, When owned books are listed, Then only the caller books are returned', async () => {
    otherAccessToken = await registerPublisher(otherEmail);
    const otherCreateResponse = await request(getServer())
      .post('/author/books')
      .set('Authorization', `Bearer ${getOtherAccessToken()}`)
      .send({
        title: 'Foreign Harbor',
        description: 'Owned by another publisher.',
        bookType: BookType.STANDARD_CHAPTER,
      });
    expect(otherCreateResponse.status).toBe(HttpStatus.CREATED);
    otherBookId = otherCreateResponse.body.id as number;
    const actualResponse = await request(getServer())
      .get('/author/books')
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    const ids: number[] = (actualResponse.body.books as Array<{ id: number }>).map(
      (book) => book.id,
    );
    expect(ids).toContain(getBookId());
    expect(ids).not.toContain(getOtherBookId());
  });

  it('Given a publisher session, When the owned book is fetched, Then metadata is returned', async () => {
    const actualResponse = await request(getServer())
      .get(`/author/books/${getBookId()}`)
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.id).toBe(getBookId());
    expect(actualResponse.body.title).toBe('The Last Lighthouse');
  });

  it('Given another publisher, When they fetch a foreign book, Then the book is hidden', async () => {
    const actualResponse = await request(getServer())
      .get(`/author/books/${getBookId()}`)
      .set('Authorization', `Bearer ${getOtherAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given another publisher, When they update a foreign book, Then the book is hidden', async () => {
    const actualResponse = await request(getServer())
      .patch(`/author/books/${getBookId()}`)
      .set('Authorization', `Bearer ${getOtherAccessToken()}`)
      .send({ title: 'Stolen Title' });
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given a publisher session, When metadata is updated, Then publishing status stays pending', async () => {
    const actualResponse = await request(getServer())
      .patch(`/author/books/${getBookId()}`)
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`)
      .send({
        title: 'Harbor Lights',
        publishingStatus: BookPublishingStatus.APPROVED,
        layoutType: 'fixed_layout',
      });
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.title).toBe('Harbor Lights');
    expect(actualResponse.body.publishingStatus).toBe(BookPublishingStatus.PENDING);
    expect(actualResponse.body.layoutType).toBeNull();
  });
});
