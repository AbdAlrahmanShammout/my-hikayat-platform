import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookType } from '@/modules/book/enum/general.enum';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Book catalog media upload (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `media-owner-${Date.now()}@book.test`;
  const otherEmail = `media-other-${Date.now()}@book.test`;
  const readerEmail = `media-reader-${Date.now()}@book.test`;
  const jpegBytes = Buffer.from('preview-jpeg');
  const pngBytes = Buffer.from('preview-png');
  const mp4Bytes = Buffer.from('promo-mp4');
  const webmBytes = Buffer.from('promo-webm');
  let app: INestApplication | undefined;
  let bookId: number | undefined;
  const emails = [ownerEmail, otherEmail, readerEmail];

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

  function getBookId(): number {
    if (bookId === undefined) {
      throw new Error('Book was not created');
    }
    return bookId;
  }

  async function registerPublisher(
    email: string,
  ): Promise<{ accessToken: string; userId: number }> {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);
    return {
      accessToken: publisherResponse.body.accessToken as string,
      userId: publisherResponse.body.user.id as number,
    };
  }

  it('Given a publisher session, When preview images are uploaded, Then unencrypted assets are stored', async () => {
    const owner = await registerPublisher(ownerEmail);
    const createdBook = await getRunningApp().get(BookService).createBook({
      title: 'Catalog Media Fixture',
      description: 'Used by catalog media e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: owner.userId,
    });
    bookId = createdBook.id;
    const jpegResponse = await request(getServer())
      .post(`/author/books/${createdBook.id}/preview-image`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .attach('file', jpegBytes, { filename: 'cover.jpg', contentType: 'image/jpeg' });
    expect(jpegResponse.status).toBe(HttpStatus.CREATED);
    expect(jpegResponse.body.kind).toBe(BookAssetKind.PREVIEW_IMAGE);
    expect(jpegResponse.body.isEncrypted).toBe(false);
    expect(jpegResponse.body.contentType).toBe('image/jpeg');
    expect(jpegResponse.body.storageKey).toMatch(
      new RegExp(`^books/${createdBook.id}/preview/[0-9a-f-]{36}$`),
    );
    const storedJpeg = await getRunningApp()
      .get(StorageManagerService)
      .getObject({ key: jpegResponse.body.storageKey });
    expect(storedJpeg.body.equals(jpegBytes)).toBe(true);
    const pngResponse = await request(getServer())
      .post(`/author/books/${createdBook.id}/preview-image`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .attach('file', pngBytes, { filename: 'spread.png', contentType: 'image/png' });
    expect(pngResponse.status).toBe(HttpStatus.CREATED);
    expect(pngResponse.body.id).not.toBe(jpegResponse.body.id);
    expect(pngResponse.body.contentType).toBe('image/png');
  });

  it('Given a publisher session, When a promo video is uploaded twice, Then the existing record is replaced', async () => {
    const loginResponse = await request(getServer()).post('/auth/login').send({
      email: ownerEmail,
      password,
    });
    const firstResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/promo-video`)
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .attach('file', mp4Bytes, { filename: 'trailer.mp4', contentType: 'video/mp4' });
    expect(firstResponse.status).toBe(HttpStatus.CREATED);
    expect(firstResponse.body.kind).toBe(BookAssetKind.PROMO_VIDEO);
    expect(firstResponse.body.isEncrypted).toBe(false);
    expect(firstResponse.body.contentType).toBe('video/mp4');
    const storedMp4 = await getRunningApp()
      .get(StorageManagerService)
      .getObject({ key: firstResponse.body.storageKey });
    expect(storedMp4.body.equals(mp4Bytes)).toBe(true);
    const secondResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/promo-video`)
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .attach('file', webmBytes, { filename: 'trailer.webm', contentType: 'video/webm' });
    expect(secondResponse.status).toBe(HttpStatus.CREATED);
    expect(secondResponse.body.id).toBe(firstResponse.body.id);
    expect(secondResponse.body.contentType).toBe('video/webm');
    expect(secondResponse.body.storageKey).not.toBe(firstResponse.body.storageKey);
    const storedWebm = await getRunningApp()
      .get(StorageManagerService)
      .getObject({ key: secondResponse.body.storageKey });
    expect(storedWebm.body.equals(webmBytes)).toBe(true);
  });

  it('Given a reader session, When a preview image is uploaded, Then access is denied', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    const actualResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/preview-image`)
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .attach('file', jpegBytes, { filename: 'cover.jpg', contentType: 'image/jpeg' });
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('ACCESS_DENIED');
  });

  it('Given another publisher, When a promo video is uploaded to a foreign book, Then the book is hidden', async () => {
    const other = await registerPublisher(otherEmail);
    const actualResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/promo-video`)
      .set('Authorization', `Bearer ${other.accessToken}`)
      .attach('file', mp4Bytes, { filename: 'trailer.mp4', contentType: 'video/mp4' });
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given an author session, When a non-image preview is uploaded, Then the type is rejected', async () => {
    const loginResponse = await request(getServer()).post('/auth/login').send({
      email: ownerEmail,
      password,
    });
    const actualResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/preview-image`)
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .attach('file', Buffer.from('notes'), { filename: 'notes.txt', contentType: 'text/plain' });
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('BOOK_ASSET_INVALID_PREVIEW_TYPE');
  });
});
