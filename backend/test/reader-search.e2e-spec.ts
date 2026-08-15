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
import { CategoryService } from '@/modules/category/category.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Reader metadata search (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `search-owner-${Date.now()}@book.test`;
  const readerEmail = `search-reader-${Date.now()}@book.test`;
  const emails = [ownerEmail, readerEmail];
  const slugSuffix = `${Date.now()}`;
  let app: INestApplication | undefined;
  let harborBookId: number | undefined;
  let mountainBookId: number | undefined;
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
    await prismaProviderService.bookSourceMetadata.deleteMany({
      where: { book: { owner: { email: { in: emails } } } },
    });
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: { in: emails } } },
    });
    await prismaProviderService.category.deleteMany({
      where: { slug: `search-${slugSuffix}` },
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

  function getHarborBookId(): number {
    if (harborBookId === undefined) {
      throw new Error('Harbor catalog book was not created');
    }
    return harborBookId;
  }

  function getMountainBookId(): number {
    if (mountainBookId === undefined) {
      throw new Error('Mountain catalog book was not created');
    }
    return mountainBookId;
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
      description: 'Used by reader metadata search e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
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
    return publishingStatusService.transitionPublishingStatus({
      bookId: created.id,
      to: BookPublishingStatus.APPROVED,
      publishedAt: new Date(),
    });
  }

  async function saveSourceMetadata(input: {
    bookId: number;
    title: string;
    creator: string;
    publisher: string;
  }): Promise<void> {
    await getRunningApp()
      .get(PrismaProviderService)
      .bookSourceMetadata.create({
        data: {
          bookId: input.bookId,
          packagePath: 'OEBPS/content.opf',
          epubVersion: '3.0',
          identifier: `urn:uuid:search-${input.bookId}`,
          title: input.title,
          language: 'en',
          creator: input.creator,
          publisher: input.publisher,
          description: null,
        },
      });
  }

  it('Given no access token, When metadata is searched, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/reader/search');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given published books, When title is searched, Then matching catalog books are returned', async () => {
    const ownerToken = await registerUser(ownerEmail);
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${ownerToken}`);
    const ownerId = publisherResponse.body.user.id as number;
    const category = await getRunningApp()
      .get(CategoryService)
      .createCategory({
        name: `Search ${slugSuffix}`,
        slug: `search-${slugSuffix}`,
      });
    const harborBook = await publishCatalogBook({
      title: 'Harbor Lights',
      categoryIds: [category.id],
      ownerId,
    });
    harborBookId = harborBook.id;
    const mountainBook = await publishCatalogBook({
      title: 'Mountain Paths',
      categoryIds: [category.id],
      ownerId,
    });
    mountainBookId = mountainBook.id;
    const pendingBook = await getRunningApp()
      .get(BookService)
      .createBook({
        title: 'Harbor Draft',
        description: 'Must not appear in metadata search.',
        layoutType: BookLayoutType.REFLOWABLE,
        bookType: BookType.STANDARD_CHAPTER,
        ownerId,
        categoryIds: [category.id],
      });
    pendingBookId = pendingBook.id;
    await saveSourceMetadata({
      bookId: getHarborBookId(),
      title: 'Harbor Lights',
      creator: 'Jane Author',
      publisher: 'Harbor Press',
    });
    await saveSourceMetadata({
      bookId: getMountainBookId(),
      title: 'Mountain Paths',
      creator: 'John Writer',
      publisher: 'Peak House',
    });
    readerAccessToken = await registerUser(readerEmail);
    const actualResponse = await request(getServer())
      .get('/reader/search')
      .query({ title: 'harbor' })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.total).toBe(1);
    expect(actualResponse.body.books[0].id).toBe(getHarborBookId());
    const catalogIds: number[] = (actualResponse.body.books as Array<{ id: number }>).map(
      (row) => row.id,
    );
    expect(catalogIds).not.toContain(getPendingBookId());
  });

  it('Given source metadata, When author is searched, Then matching catalog books are returned', async () => {
    const actualResponse = await request(getServer())
      .get('/reader/search')
      .query({ author: 'JANE' })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.total).toBe(1);
    expect(actualResponse.body.books[0].id).toBe(getHarborBookId());
  });

  it('Given source metadata, When publisher is searched, Then matching catalog books are returned', async () => {
    const actualResponse = await request(getServer())
      .get('/reader/search')
      .query({ publisher: 'peak' })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.total).toBe(1);
    expect(actualResponse.body.books[0].id).toBe(getMountainBookId());
  });

  it('Given conflicting title and author, When both are searched, Then no catalog books are returned', async () => {
    const actualResponse = await request(getServer())
      .get('/reader/search')
      .query({ title: 'Harbor', author: 'John Writer' })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.total).toBe(0);
    expect(actualResponse.body.books).toEqual([]);
  });
});
