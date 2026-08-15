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
import { CollectionService } from '@/modules/collection/collection.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Reader collections (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `reader-collection-owner-${Date.now()}@book.test`;
  const readerEmail = `reader-collection-reader-${Date.now()}@book.test`;
  const emails = [ownerEmail, readerEmail];
  const slugSuffix = `${Date.now()}`;
  let app: INestApplication | undefined;
  let readerAccessToken: string | undefined;
  let firstBookId: number | undefined;
  let secondBookId: number | undefined;
  let pendingBookId: number | undefined;
  let collectionId: number | undefined;
  let unpublishedOnlyCollectionId: number | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.collectionBook.deleteMany({
      where: { collection: { title: { contains: slugSuffix } } },
    });
    await prismaProviderService.collection.deleteMany({
      where: { title: { contains: slugSuffix } },
    });
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: { in: emails } } },
    });
    await prismaProviderService.category.deleteMany({
      where: { slug: `reader-collection-${slugSuffix}` },
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

  function getReaderAccessToken(): string {
    if (readerAccessToken === undefined) {
      throw new Error('Reader access token was not created');
    }
    return readerAccessToken;
  }

  function getFirstBookId(): number {
    if (firstBookId === undefined) {
      throw new Error('First catalog book was not created');
    }
    return firstBookId;
  }

  function getSecondBookId(): number {
    if (secondBookId === undefined) {
      throw new Error('Second catalog book was not created');
    }
    return secondBookId;
  }

  function getPendingBookId(): number {
    if (pendingBookId === undefined) {
      throw new Error('Pending book was not created');
    }
    return pendingBookId;
  }

  function getCollectionId(): number {
    if (collectionId === undefined) {
      throw new Error('Collection was not created');
    }
    return collectionId;
  }

  function getUnpublishedOnlyCollectionId(): number {
    if (unpublishedOnlyCollectionId === undefined) {
      throw new Error('Unpublished-only collection was not created');
    }
    return unpublishedOnlyCollectionId;
  }

  function readCollectionBooks(body: unknown): { id: number }[] {
    if (typeof body !== 'object' || body === null || !('books' in body)) {
      throw new Error('Collection response books were missing');
    }
    const books: unknown = body.books;
    if (!Array.isArray(books)) {
      throw new Error('Collection response books were missing');
    }
    return books as { id: number }[];
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
      description: 'Used by reader collection e2e tests.',
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

  it('Given no access token, When collections are listed, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/reader/collections');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given curated collections, When a reader browses and opens them, Then published books appear in editorial order', async () => {
    const ownerToken = await registerUser(ownerEmail);
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${ownerToken}`);
    const ownerId = publisherResponse.body.user.id as number;
    const category = await getRunningApp()
      .get(CategoryService)
      .createCategory({
        name: `Reader Collection ${slugSuffix}`,
        slug: `reader-collection-${slugSuffix}`,
      });
    const firstBook = await publishCatalogBook({
      title: 'Harbor Lights',
      categoryIds: [category.id],
      ownerId,
    });
    const secondBook = await publishCatalogBook({
      title: 'Mountain Paths',
      categoryIds: [category.id],
      ownerId,
    });
    const pendingBook = await getRunningApp()
      .get(BookService)
      .createBook({
        title: 'Unpublished Draft',
        description: 'Must not appear in reader collections.',
        layoutType: BookLayoutType.REFLOWABLE,
        bookType: BookType.STANDARD_CHAPTER,
        ownerId,
        categoryIds: [category.id],
      });
    firstBookId = firstBook.id;
    secondBookId = secondBook.id;
    pendingBookId = pendingBook.id;
    const collectionService: CollectionService = getRunningApp().get(CollectionService);
    const created = await collectionService.createCollection({
      title: `Harbor Picks ${slugSuffix}`,
      bookIds: [getSecondBookId(), getPendingBookId(), getFirstBookId()],
    });
    collectionId = created.id;
    const unpublishedOnly = await collectionService.createCollection({
      title: `Draft Shelf ${slugSuffix}`,
      bookIds: [getPendingBookId()],
    });
    unpublishedOnlyCollectionId = unpublishedOnly.id;
    readerAccessToken = await registerUser(readerEmail);
    const listResponse = await request(getServer())
      .get('/reader/collections')
      .query({ limit: 100 })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(listResponse.status).toBe(HttpStatus.OK);
    expect(listResponse.body.total).toBeGreaterThanOrEqual(2);
    const listedCollections = listResponse.body.collections as Array<{
      id: number;
      title: string;
      books: { id: number }[];
    }>;
    const listedHarbor = listedCollections.find((row) => row.id === getCollectionId());
    const listedDraft = listedCollections.find(
      (row) => row.id === getUnpublishedOnlyCollectionId(),
    );
    expect(listedHarbor?.title).toBe(`Harbor Picks ${slugSuffix}`);
    expect(listedHarbor?.books.map((book) => book.id)).toEqual([
      getSecondBookId(),
      getFirstBookId(),
    ]);
    expect(listedDraft?.books).toEqual([]);
    const getResponse = await request(getServer())
      .get(`/reader/collections/${getCollectionId()}`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(getResponse.status).toBe(HttpStatus.OK);
    expect(getResponse.body.title).toBe(`Harbor Picks ${slugSuffix}`);
    expect(readCollectionBooks(getResponse.body).map((book) => book.id)).toEqual([
      getSecondBookId(),
      getFirstBookId(),
    ]);
    await collectionService.deleteCollection(getCollectionId());
    const missingResponse = await request(getServer())
      .get(`/reader/collections/${getCollectionId()}`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(missingResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(missingResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });
});
