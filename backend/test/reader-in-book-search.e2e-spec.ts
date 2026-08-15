import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookProcessingStatusService } from '@/modules/book/book-processing-status.service';
import { BookPublishingStatusService } from '@/modules/book/book-publishing-status.service';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookPageSpreadRole } from '@/modules/book-processing/enum/general.enum';
import { CategoryService } from '@/modules/category/category.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';

describe('Reader in-book search (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `in-book-owner-${Date.now()}@book.test`;
  const readerEmail = `in-book-reader-${Date.now()}@book.test`;
  const emails = [ownerEmail, readerEmail];
  const slugSuffix = `${Date.now()}`;
  let app: INestApplication | undefined;
  let reflowableBookId: number | undefined;
  let fixedLayoutBookId: number | undefined;
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
    await prismaProviderService.bookPageTextLayer.deleteMany({
      where: { book: { owner: { email: { in: emails } } } },
    });
    await prismaProviderService.bookSpread.deleteMany({
      where: { book: { owner: { email: { in: emails } } } },
    });
    await prismaProviderService.bookPage.deleteMany({
      where: { book: { owner: { email: { in: emails } } } },
    });
    await prismaProviderService.bookChapter.deleteMany({
      where: { book: { owner: { email: { in: emails } } } },
    });
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: { in: emails } } },
    });
    await prismaProviderService.category.deleteMany({
      where: { slug: `in-book-${slugSuffix}` },
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
      throw new Error('Reflowable catalog book was not created');
    }
    return reflowableBookId;
  }

  function getFixedLayoutBookId(): number {
    if (fixedLayoutBookId === undefined) {
      throw new Error('Fixed-layout catalog book was not created');
    }
    return fixedLayoutBookId;
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
    layoutType: BookLayoutType;
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
      description: 'Used by reader in-book search e2e tests.',
      layoutType: input.layoutType,
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

  it('Given no access token, When in-book text is searched, Then authentication fails', async () => {
    const actualResponse = await request(getServer())
      .get('/reader/search/1')
      .query({ q: 'Harbor' });
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given a reflowable book, When chapter text is searched, Then matching hits are returned', async () => {
    const ownerToken = await registerUser(ownerEmail);
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${ownerToken}`);
    const ownerId = publisherResponse.body.user.id as number;
    const category = await getRunningApp()
      .get(CategoryService)
      .createCategory({
        name: `In Book ${slugSuffix}`,
        slug: `in-book-${slugSuffix}`,
      });
    const reflowableBook = await publishCatalogBook({
      title: 'Harbor Chronicle',
      layoutType: BookLayoutType.REFLOWABLE,
      categoryIds: [category.id],
      ownerId,
    });
    reflowableBookId = reflowableBook.id;
    const fixedLayoutBook = await publishCatalogBook({
      title: 'Harbor Picture Book',
      layoutType: BookLayoutType.FIXED_LAYOUT,
      categoryIds: [category.id],
      ownerId,
    });
    fixedLayoutBookId = fixedLayoutBook.id;
    const pendingBook = await getRunningApp()
      .get(BookService)
      .createBook({
        title: 'Harbor Draft',
        description: 'Must not be searchable.',
        layoutType: BookLayoutType.REFLOWABLE,
        bookType: BookType.STANDARD_CHAPTER,
        ownerId,
        categoryIds: [category.id],
      });
    pendingBookId = pendingBook.id;
    const prismaProviderService: PrismaProviderService = getRunningApp().get(PrismaProviderService);
    await prismaProviderService.bookChapter.create({
      data: {
        bookId: getReflowableBookId(),
        spineIndex: 0,
        href: 'chapter1.xhtml',
        manifestId: 'c1',
        title: 'Dawn Watch',
        contentText: 'The Harbor lights were visible from the ridge.',
      },
    });
    await prismaProviderService.bookChapter.create({
      data: {
        bookId: getReflowableBookId(),
        spineIndex: 1,
        href: 'chapter2.xhtml',
        manifestId: 'c2',
        title: 'Mountain Pass',
        contentText: 'Snow covered the mountain path.',
      },
    });
    const page = await prismaProviderService.bookPage.create({
      data: {
        bookId: getFixedLayoutBookId(),
        spineIndex: 0,
        href: 'page1.xhtml',
        manifestId: 'p1',
        title: 'Left Page',
        width: 1200,
        height: 1600,
        spreadRole: BookPageSpreadRole.LEFT,
      },
    });
    await prismaProviderService.bookSpread.create({
      data: {
        bookId: getFixedLayoutBookId(),
        spreadIndex: 0,
        leftPageId: page.id,
      },
    });
    await prismaProviderService.bookPageTextLayer.create({
      data: {
        bookId: getFixedLayoutBookId(),
        pageId: page.id,
        contentText: 'Harbor lights',
        runs: {
          create: [{ sortOrder: 0, text: 'Harbor', x: 120, y: 80, width: 80, height: 20 }],
        },
      },
    });
    readerAccessToken = await registerUser(readerEmail);
    const actualResponse = await request(getServer())
      .get(`/reader/search/${getReflowableBookId()}`)
      .query({ q: 'harbor' })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.total).toBe(1);
    expect(actualResponse.body.hits[0].layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualResponse.body.hits[0].spineIndex).toBe(0);
    expect(actualResponse.body.hits[0].title).toBe('Dawn Watch');
    expect(actualResponse.body.hits[0].excerpt).toContain('Harbor');
  });

  it('Given a fixed-layout book, When page text is searched, Then highlight runs are returned', async () => {
    const actualResponse = await request(getServer())
      .get(`/reader/search/${getFixedLayoutBookId()}`)
      .query({ q: 'Harbor' })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.total).toBe(1);
    expect(actualResponse.body.hits[0].layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
    expect(actualResponse.body.hits[0].pageNumber).toBe(1);
    expect(actualResponse.body.hits[0].spreadIndex).toBe(0);
    expect(actualResponse.body.hits[0].highlights[0]).toEqual(
      expect.objectContaining({ text: 'Harbor', x: 120, y: 80 }),
    );
  });

  it('Given a pending book, When in-book text is searched, Then it is not found', async () => {
    const actualResponse = await request(getServer())
      .get(`/reader/search/${getPendingBookId()}`)
      .query({ q: 'Harbor' })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given no query, When in-book text is searched, Then the request is rejected', async () => {
    const actualResponse = await request(getServer())
      .get(`/reader/search/${getReflowableBookId()}`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(actualResponse.body.code).toBe('BAD_USER_INPUT');
  });
});
