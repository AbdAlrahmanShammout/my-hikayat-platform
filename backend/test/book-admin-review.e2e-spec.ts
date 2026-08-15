import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { EPUB_OCF } from '@/modules/book-processing/epub-ocf.constant';
import { ZipArchive } from '@/modules/book-processing/zip-archive.helper';
import { UserRole } from '@/modules/user/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

const CONTAINER_XML = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`;

function createReflowableEpubBytes(): Buffer {
  const packageXml = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:admin-review-e2e</dc:identifier>
    <dc:title>Harbor Lights</dc:title>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="c1"/>
  </spine>
</package>
`;
  return ZipArchive.createStored([
    { name: EPUB_OCF.mimetypePath, data: Buffer.from(EPUB_OCF.mimetypeValue) },
    { name: EPUB_OCF.containerPath, data: Buffer.from(CONTAINER_XML) },
    { name: 'OEBPS/content.opf', data: Buffer.from(packageXml) },
    {
      name: 'OEBPS/chapter1.xhtml',
      data: Buffer.from('<html><body><h1>The Harbor</h1><p>First chapter text.</p></body></html>'),
    },
  ]);
}

describe('Book admin review (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `admin-review-owner-${Date.now()}@book.test`;
  const adminEmail = `admin-review-admin-${Date.now()}@book.test`;
  const emails = [ownerEmail, adminEmail];
  let app: INestApplication | undefined;
  let approveBookId: number | undefined;
  let rejectBookId: number | undefined;
  let ownerAccessToken: string | undefined;
  let adminAccessToken: string | undefined;

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
    await prismaProviderService.bookSourceMetadata.deleteMany({
      where: { book: { owner: { email: { in: emails } } } },
    });
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

  function getApproveBookId(): number {
    if (approveBookId === undefined) {
      throw new Error('Approve book was not created');
    }
    return approveBookId;
  }

  function getRejectBookId(): number {
    if (rejectBookId === undefined) {
      throw new Error('Reject book was not created');
    }
    return rejectBookId;
  }

  function getOwnerAccessToken(): string {
    if (ownerAccessToken === undefined) {
      throw new Error('Owner access token was not created');
    }
    return ownerAccessToken;
  }

  function getAdminAccessToken(): string {
    if (adminAccessToken === undefined) {
      throw new Error('Admin access token was not created');
    }
    return adminAccessToken;
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

  async function submitReflowableBook(
    title: string,
    ownerId: number,
    accessToken: string,
  ): Promise<number> {
    const createdBook = await getRunningApp().get(BookService).createBook({
      title,
      description: 'Used by admin review e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
    });
    const uploadResponse = await request(getServer())
      .post(`/author/books/${createdBook.id}/source`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', createReflowableEpubBytes(), {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    const submitResponse = await request(getServer())
      .post(`/author/books/${createdBook.id}/submit-for-review`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(submitResponse.status).toBe(HttpStatus.OK);
    return createdBook.id;
  }

  it('Given no access token, When the review queue is listed, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/admin/books');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given an author session, When the review queue is listed, Then access is denied', async () => {
    const owner = await registerPublisher(ownerEmail);
    ownerAccessToken = owner.accessToken;
    approveBookId = await submitReflowableBook(
      'Approve Catalog Title',
      owner.userId,
      owner.accessToken,
    );
    rejectBookId = await submitReflowableBook(
      'Reject Catalog Title',
      owner.userId,
      owner.accessToken,
    );
    const actualResponse = await request(getServer())
      .get('/admin/books')
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('ACCESS_DENIED');
  });

  it('Given an admin session, When in-review books are listed and fetched, Then the review queue is returned', async () => {
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
    adminAccessToken = loginResponse.body.accessToken as string;
    const listResponse = await request(getServer())
      .get('/admin/books')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(listResponse.status).toBe(HttpStatus.OK);
    expect(listResponse.body.total).toBe(2);
    expect(listResponse.body.books).toHaveLength(2);
    expect(listResponse.body.books).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: getApproveBookId(),
          publishingStatus: BookPublishingStatus.IN_REVIEW,
        }),
        expect.objectContaining({
          id: getRejectBookId(),
          publishingStatus: BookPublishingStatus.IN_REVIEW,
        }),
      ]),
    );
    const getResponse = await request(getServer())
      .get(`/admin/books/${getApproveBookId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(getResponse.status).toBe(HttpStatus.OK);
    expect(getResponse.body.id).toBe(getApproveBookId());
    expect(getResponse.body.title).toBe('Approve Catalog Title');
    expect(getResponse.body.processingStatus).toBe(BookProcessingStatus.READY);
    expect(getResponse.body.layoutType).toBe(BookLayoutType.REFLOWABLE);
  });

  it('Given an in-review book, When an admin approves it, Then it is published', async () => {
    const actualResponse = await request(getServer())
      .post(`/admin/books/${getApproveBookId()}/approve`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.publishingStatus).toBe(BookPublishingStatus.APPROVED);
    expect(actualResponse.body.publishedAt).toEqual(expect.any(String));
    expect(actualResponse.body.title).toBe('Approve Catalog Title');
    const listResponse = await request(getServer())
      .get('/admin/books')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(listResponse.body.total).toBe(1);
    expect(listResponse.body.books[0].id).toBe(getRejectBookId());
  });

  it('Given an in-review book, When an admin rejects it, Then it is not published', async () => {
    const actualResponse = await request(getServer())
      .post(`/admin/books/${getRejectBookId()}/reject`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.publishingStatus).toBe(BookPublishingStatus.REJECTED);
    expect(actualResponse.body.publishedAt).toBeNull();
    expect(actualResponse.body.title).toBe('Reject Catalog Title');
    const listResponse = await request(getServer())
      .get('/admin/books')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(listResponse.body.total).toBe(0);
    expect(listResponse.body.books).toHaveLength(0);
  });

  it('Given an approved book, When it is approved again, Then the publishing transition is rejected', async () => {
    const actualResponse = await request(getServer())
      .post(`/admin/books/${getApproveBookId()}/approve`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('BOOK_INVALID_PUBLISHING_TRANSITION');
  });

  it('Given a missing book, When an admin approves it, Then the book is hidden', async () => {
    const actualResponse = await request(getServer())
      .post('/admin/books/999999/approve')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });
});
