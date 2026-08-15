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
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { CategoryService } from '@/modules/category/category.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { EncryptionManagerService } from '@/providers/encryption/encryption-manager.service';
import { MEMORY_STORAGE_URI_SCHEME } from '@/providers/storage/memory/consts';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

import { assignMonthlySubscription } from './assign-monthly-subscription';
import { createTestingApp } from './create-testing-app';

describe('Reader encrypted delivery grants (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `delivery-owner-${Date.now()}@book.test`;
  const freeEmail = `delivery-free-${Date.now()}@book.test`;
  const paidEmail = `delivery-paid-${Date.now()}@book.test`;
  const emails = [ownerEmail, freeEmail, paidEmail];
  const slugSuffix = `${Date.now()}`;
  const pdfBytes = Buffer.from('%PDF-1.4 delivery-source');
  let app: INestApplication | undefined;
  const createdCategoryIds: number[] = [];

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.bookAsset.deleteMany({
      where: { book: { owner: { email: { in: emails } } } },
    });
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: { in: emails } } },
    });
    if (createdCategoryIds.length > 0) {
      await prismaProviderService.category.deleteMany({
        where: { id: { in: createdCategoryIds } },
      });
    }
    await prismaProviderService.subscription.deleteMany({
      where: { user: { email: { in: emails } } },
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

  async function registerUser(email: string): Promise<{ userId: number; accessToken: string }> {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    return {
      userId: registerResponse.body.user.id as number,
      accessToken: registerResponse.body.accessToken as string,
    };
  }

  async function registerPublisher(
    email: string,
  ): Promise<{ accessToken: string; userId: number }> {
    const owner = await registerUser(email);
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${owner.accessToken}`);
    return {
      accessToken: publisherResponse.body.accessToken as string,
      userId: publisherResponse.body.user.id as number,
    };
  }

  async function createOwnedBook(ownerId: number, title: string): Promise<BookEntity> {
    const categoryId: number = createdCategoryIds[0];
    return getRunningApp()
      .get(BookService)
      .createBook({
        title,
        description: 'Used by encrypted delivery e2e tests.',
        layoutType: BookLayoutType.REFLOWABLE,
        bookType: BookType.STANDARD_CHAPTER,
        ownerId,
        categoryIds: [categoryId],
      });
  }

  async function markCatalogReady(bookId: number): Promise<BookEntity> {
    const processingStatusService: BookProcessingStatusService = getRunningApp().get(
      BookProcessingStatusService,
    );
    const publishingStatusService: BookPublishingStatusService = getRunningApp().get(
      BookPublishingStatusService,
    );
    await processingStatusService.transitionProcessingStatus({
      bookId,
      to: BookProcessingStatus.PROCESSING,
    });
    await processingStatusService.transitionProcessingStatus({
      bookId,
      to: BookProcessingStatus.READY,
    });
    await publishingStatusService.transitionPublishingStatus({
      bookId,
      to: BookPublishingStatus.IN_REVIEW,
    });
    return publishingStatusService.approveBook(bookId);
  }

  it('Given no access token, When a delivery grant is requested, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).post('/reader/books/1/delivery-grant');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('Given a published encrypted source, When a paid reader requests a grant, Then the URL points at ciphertext', async () => {
    const owner = await registerPublisher(ownerEmail);
    const category = await getRunningApp()
      .get(CategoryService)
      .createCategory({
        name: `Delivery ${slugSuffix}`,
        slug: `delivery-${slugSuffix}`,
      });
    createdCategoryIds.push(category.id);
    const publishedBook = await createOwnedBook(owner.userId, 'Delivery Harbor');
    const unpublishedBook = await createOwnedBook(owner.userId, 'Unpublished Delivery Harbor');
    const readyWithoutSource = await createOwnedBook(owner.userId, 'Ready Delivery Without Source');
    const uploadResponse = await request(getServer())
      .post(`/author/books/${publishedBook.id}/source`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .attach('file', pdfBytes, { filename: 'book.pdf', contentType: 'application/pdf' });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    await markCatalogReady(publishedBook.id);
    await markCatalogReady(readyWithoutSource.id);
    const freeUser = await registerUser(freeEmail);
    const forbiddenResponse = await request(getServer())
      .post(`/reader/books/${publishedBook.id}/delivery-grant`)
      .set('Authorization', `Bearer ${freeUser.accessToken}`);
    expect(forbiddenResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(forbiddenResponse.body.code).toBe('FULL_BOOK_ACCESS_DENIED');
    const paidUser = await registerUser(paidEmail);
    await assignMonthlySubscription(getRunningApp(), paidUser.userId);
    const hiddenResponse = await request(getServer())
      .post(`/reader/books/${unpublishedBook.id}/delivery-grant`)
      .set('Authorization', `Bearer ${paidUser.accessToken}`);
    expect(hiddenResponse.status).toBe(HttpStatus.NOT_FOUND);
    const missingSource = await request(getServer())
      .post(`/reader/books/${readyWithoutSource.id}/delivery-grant`)
      .set('Authorization', `Bearer ${paidUser.accessToken}`);
    expect(missingSource.status).toBe(HttpStatus.BAD_REQUEST);
    expect(missingSource.body.code).toBe('BOOK_ASSET_ENCRYPTED_SOURCE_MISSING');
    const grantResponse = await request(getServer())
      .post(`/reader/books/${publishedBook.id}/delivery-grant`)
      .set('Authorization', `Bearer ${paidUser.accessToken}`);
    expect(grantResponse.status).toBe(HttpStatus.OK);
    expect(grantResponse.body.isEncrypted).toBe(true);
    expect(grantResponse.body.kind).toBe(BookAssetKind.SOURCE);
    expect(grantResponse.body.bookId).toBe(publishedBook.id);
    expect(grantResponse.body.storageKey).toBeUndefined();
    expect(grantResponse.body.url).toMatch(new RegExp(`^${MEMORY_STORAGE_URI_SCHEME}://`));
    const encodedKey: string = String(grantResponse.body.url).slice(
      `${MEMORY_STORAGE_URI_SCHEME}://`.length,
    );
    const stored = await getRunningApp()
      .get(StorageManagerService)
      .getObject({ key: decodeURIComponent(encodedKey) });
    expect(stored.body.equals(pdfBytes)).toBe(false);
    const decrypted = getRunningApp()
      .get(EncryptionManagerService)
      .decrypt({ ciphertext: stored.body });
    expect(decrypted.plaintext.equals(pdfBytes)).toBe(true);
  });
});
