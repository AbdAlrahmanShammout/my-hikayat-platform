import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookType } from '@/modules/book/enum/general.enum';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { UserRole } from '@/modules/user/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { EncryptionManagerService } from '@/providers/encryption/encryption-manager.service';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Book source upload (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `source-owner-${Date.now()}@book.test`;
  const otherEmail = `source-other-${Date.now()}@book.test`;
  const readerEmail = `source-reader-${Date.now()}@book.test`;
  const adminEmail = `source-admin-${Date.now()}@book.test`;
  const pdfBytes = Buffer.from('%PDF-1.4 source-file');
  const epubBytes = Buffer.from('PK\u0003\u0004epub-source');
  let app: INestApplication | undefined;
  let bookId: number | undefined;
  const emails = [ownerEmail, otherEmail, readerEmail, adminEmail];

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

  it('Given no access token, When a source file is uploaded, Then authentication fails', async () => {
    const actualResponse = await request(getServer())
      .post('/author/books/1/source')
      .attach('file', pdfBytes, { filename: 'book.pdf', contentType: 'application/pdf' });
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given a publisher session, When PDF and EPUB sources are uploaded, Then encrypted assets are stored', async () => {
    const owner = await registerPublisher(ownerEmail);
    const createdBookResponse = await request(getServer())
      .post('/author/books')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        title: 'Source Upload Fixture',
        description: 'Used by source upload e2e tests.',
        bookType: BookType.STANDARD_CHAPTER,
      });
    expect(createdBookResponse.status).toBe(HttpStatus.CREATED);
    bookId = createdBookResponse.body.id as number;
    const pdfResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .attach('file', pdfBytes, { filename: 'book.pdf', contentType: 'application/pdf' });
    expect(pdfResponse.status).toBe(HttpStatus.CREATED);
    expect(pdfResponse.body.kind).toBe(BookAssetKind.SOURCE);
    expect(pdfResponse.body.isEncrypted).toBe(true);
    expect(pdfResponse.body.contentType).toBe('application/pdf');
    expect(pdfResponse.body.originalFileName).toBe('book.pdf');
    expect(pdfResponse.body.storageKey).toMatch(
      new RegExp(`^books/${getBookId()}/source/[0-9a-f-]{36}$`),
    );
    expect(pdfResponse.body.storageKey).not.toContain('book.pdf');
    expect(pdfResponse.body.checksumSha256).toMatch(/^[a-f0-9]{64}$/);
    const storedPdf = await getRunningApp()
      .get(StorageManagerService)
      .getObject({ key: pdfResponse.body.storageKey });
    expect(storedPdf.body.equals(pdfBytes)).toBe(false);
    expect(storedPdf.byteSize).toBe(pdfResponse.body.byteSize);
    const decryptedPdf = getRunningApp()
      .get(EncryptionManagerService)
      .decrypt({ ciphertext: storedPdf.body });
    expect(decryptedPdf.plaintext.equals(pdfBytes)).toBe(true);
    const epubResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .attach('file', epubBytes, { filename: 'book.epub', contentType: 'application/epub+zip' });
    expect(epubResponse.status).toBe(HttpStatus.CREATED);
    expect(epubResponse.body.id).not.toBe(pdfResponse.body.id);
    expect(epubResponse.body.contentType).toBe('application/epub+zip');
    expect(epubResponse.body.kind).toBe(BookAssetKind.SOURCE);
  });

  it('Given a reader session, When a source file is uploaded, Then access is denied', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    const actualResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .attach('file', pdfBytes, { filename: 'book.pdf', contentType: 'application/pdf' });
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('ACCESS_DENIED');
  });

  it('Given another publisher, When their source is uploaded to a foreign book, Then the book is hidden', async () => {
    const other = await registerPublisher(otherEmail);
    const actualResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${other.accessToken}`)
      .attach('file', pdfBytes, { filename: 'book.pdf', contentType: 'application/pdf' });
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given an admin session, When a source is uploaded for another owner, Then the asset is created', async () => {
    const admin = await registerPublisher(adminEmail);
    const prismaProviderService: PrismaProviderService = getRunningApp().get(PrismaProviderService);
    await prismaProviderService.user.update({
      where: { id: admin.userId },
      data: { role: UserRole.ADMIN },
    });
    const loginResponse = await request(getServer()).post('/auth/login').send({
      email: adminEmail,
      password,
    });
    const actualResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .attach('file', pdfBytes, { filename: 'admin.pdf', contentType: 'application/pdf' });
    expect(actualResponse.status).toBe(HttpStatus.CREATED);
    expect(actualResponse.body.kind).toBe(BookAssetKind.SOURCE);
    expect(actualResponse.body.originalFileName).toBe('admin.pdf');
  });

  it('Given an author session, When a non-book file is uploaded, Then the source type is rejected', async () => {
    const loginResponse = await request(getServer()).post('/auth/login').send({
      email: ownerEmail,
      password,
    });
    const actualResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .attach('file', Buffer.from('notes'), { filename: 'notes.txt', contentType: 'text/plain' });
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('BOOK_ASSET_INVALID_SOURCE_TYPE');
  });

  it('Given an author session, When the file field is omitted, Then an empty source is rejected', async () => {
    const loginResponse = await request(getServer()).post('/auth/login').send({
      email: ownerEmail,
      password,
    });
    const actualResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('BOOK_ASSET_EMPTY_SOURCE');
  });
});
