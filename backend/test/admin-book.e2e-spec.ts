import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
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

import { assignMonthlySubscription } from './assign-monthly-subscription';
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
    <dc:identifier id="uid">urn:uuid:admin-book-e2e</dc:identifier>
    <dc:title>Admin Harbor Lights</dc:title>
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

describe('Admin book management (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `admin-book-owner-${Date.now()}@book.test`;
  const adminEmail = `admin-book-admin-${Date.now()}@book.test`;
  const readerEmail = `admin-book-reader-${Date.now()}@book.test`;
  const emails = [ownerEmail, adminEmail, readerEmail];
  let app: INestApplication | undefined;
  let ownerAccessToken: string | undefined;
  let adminAccessToken: string | undefined;
  let readerAccessToken: string | undefined;
  let pendingBookId: number | undefined;
  let publishedBookId: number | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.readingProgress.deleteMany({
      where: {
        OR: [{ user: { email: { in: emails } } }, { book: { owner: { email: { in: emails } } } }],
      },
    });
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

  function getReaderAccessToken(): string {
    if (readerAccessToken === undefined) {
      throw new Error('Reader access token was not created');
    }
    return readerAccessToken;
  }

  function getPendingBookId(): number {
    if (pendingBookId === undefined) {
      throw new Error('Pending book was not created');
    }
    return pendingBookId;
  }

  function getPublishedBookId(): number {
    if (publishedBookId === undefined) {
      throw new Error('Published book was not created');
    }
    return publishedBookId;
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

  it('Given pending and in-review books, When an admin lists without a filter, Then every status is returned', async () => {
    const owner = await registerPublisher(ownerEmail);
    ownerAccessToken = owner.accessToken;
    const pendingResponse = await request(getServer())
      .post('/author/books')
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`)
      .send({
        title: 'Pending Harbor',
        description: 'Stays pending for admin list e2e.',
        bookType: BookType.STANDARD_CHAPTER,
      });
    expect(pendingResponse.status).toBe(HttpStatus.CREATED);
    pendingBookId = pendingResponse.body.id as number;
    const reviewCreateResponse = await request(getServer())
      .post('/author/books')
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`)
      .send({
        title: 'Review Harbor',
        description: 'Submitted for admin manage e2e.',
        bookType: BookType.STANDARD_CHAPTER,
      });
    expect(reviewCreateResponse.status).toBe(HttpStatus.CREATED);
    publishedBookId = reviewCreateResponse.body.id as number;
    const uploadResponse = await request(getServer())
      .post(`/author/books/${getPublishedBookId()}/source`)
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`)
      .attach('file', createReflowableEpubBytes(), {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    const submitResponse = await request(getServer())
      .post(`/author/books/${getPublishedBookId()}/submit-for-review`)
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`);
    expect(submitResponse.status).toBe(HttpStatus.OK);
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
    const allResponse = await request(getServer())
      .get('/admin/books')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(allResponse.status).toBe(HttpStatus.OK);
    const ids: number[] = (allResponse.body.books as Array<{ id: number }>).map((book) => book.id);
    expect(ids).toEqual(expect.arrayContaining([getPendingBookId(), getPublishedBookId()]));
    const reviewResponse = await request(getServer())
      .get('/admin/books')
      .query({ publishingStatus: BookPublishingStatus.IN_REVIEW })
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    const reviewIds: number[] = (reviewResponse.body.books as Array<{ id: number }>).map(
      (book) => book.id,
    );
    expect(reviewIds).toContain(getPublishedBookId());
    expect(reviewIds).not.toContain(getPendingBookId());
  });

  it('Given an admin session, When metadata is patched, Then publishing status is unchanged', async () => {
    const actualResponse = await request(getServer())
      .patch(`/admin/books/${getPendingBookId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({
        title: 'Edited Pending Harbor',
        publishingStatus: BookPublishingStatus.APPROVED,
      });
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.title).toBe('Edited Pending Harbor');
    expect(actualResponse.body.publishingStatus).toBe(BookPublishingStatus.PENDING);
  });

  it('Given a pending book, When an admin unpublishes it, Then the book is not currently published', async () => {
    const actualResponse = await request(getServer())
      .post(`/admin/books/${getPendingBookId()}/unpublish`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('BOOK_NOT_PUBLISHED');
  });

  it('Given an approved book, When an admin unpublishes it, Then it stays approved and leaves the catalog', async () => {
    const approveResponse = await request(getServer())
      .post(`/admin/books/${getPublishedBookId()}/approve`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(approveResponse.status).toBe(HttpStatus.OK);
    expect(approveResponse.body.publishingStatus).toBe(BookPublishingStatus.APPROVED);
    expect(approveResponse.body.publishedAt).toEqual(expect.any(String));
    const reader = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    readerAccessToken = reader.body.accessToken as string;
    await assignMonthlySubscription(getRunningApp(), reader.body.user.id as number);
    const catalogBefore = await request(getServer())
      .get(`/reader/catalog/${getPublishedBookId()}`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(catalogBefore.status).toBe(HttpStatus.OK);
    const unpublishResponse = await request(getServer())
      .post(`/admin/books/${getPublishedBookId()}/unpublish`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(unpublishResponse.status).toBe(HttpStatus.OK);
    expect(unpublishResponse.body.publishingStatus).toBe(BookPublishingStatus.APPROVED);
    expect(unpublishResponse.body.publishedAt).toBeNull();
    expect(unpublishResponse.body.processingStatus).toBe(BookProcessingStatus.READY);
    expect(unpublishResponse.body.layoutType).toBe(BookLayoutType.REFLOWABLE);
    const catalogAfter = await request(getServer())
      .get(`/reader/catalog/${getPublishedBookId()}`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(catalogAfter.status).toBe(HttpStatus.NOT_FOUND);
    const progressResponse = await request(getServer())
      .put(`/reader/books/${getPublishedBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 0, scrollOffset: 0 });
    expect(progressResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(progressResponse.body.code).toBe('RESOURCE_NOT_FOUND');
    const prismaProviderService: PrismaProviderService = getRunningApp().get(PrismaProviderService);
    const unpublishAudit = await prismaProviderService.auditLog.findFirst({
      where: {
        action: AuditAction.BOOK_UNPUBLISHED,
        subjectType: AuditSubjectType.BOOK,
        subjectId: getPublishedBookId(),
      },
    });
    expect(unpublishAudit).not.toBeNull();
  });

  it('Given an unpublished approved book, When an admin republishes it, Then the catalog and reading access return', async () => {
    const republishResponse = await request(getServer())
      .post(`/admin/books/${getPublishedBookId()}/republish`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(republishResponse.status).toBe(HttpStatus.OK);
    expect(republishResponse.body.publishingStatus).toBe(BookPublishingStatus.APPROVED);
    expect(republishResponse.body.publishedAt).toEqual(expect.any(String));
    const catalogResponse = await request(getServer())
      .get(`/reader/catalog/${getPublishedBookId()}`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(catalogResponse.status).toBe(HttpStatus.OK);
    const progressResponse = await request(getServer())
      .put(`/reader/books/${getPublishedBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 0, scrollOffset: 0 });
    expect(progressResponse.status).toBe(HttpStatus.OK);
    const alreadyPublished = await request(getServer())
      .post(`/admin/books/${getPublishedBookId()}/republish`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(alreadyPublished.status).toBe(HttpStatus.BAD_REQUEST);
    expect(alreadyPublished.body.code).toBe('BOOK_ALREADY_PUBLISHED');
    const prismaProviderService: PrismaProviderService = getRunningApp().get(PrismaProviderService);
    const republishAudit = await prismaProviderService.auditLog.findFirst({
      where: {
        action: AuditAction.BOOK_REPUBLISHED,
        subjectType: AuditSubjectType.BOOK,
        subjectId: getPublishedBookId(),
      },
    });
    expect(republishAudit).not.toBeNull();
  });

  it('Given an admin session, When a book is deleted, Then it is hidden from admin and author APIs', async () => {
    const deleteResponse = await request(getServer())
      .delete(`/admin/books/${getPendingBookId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(deleteResponse.status).toBe(HttpStatus.OK);
    expect(deleteResponse.body.id).toBe(getPendingBookId());
    const adminGet = await request(getServer())
      .get(`/admin/books/${getPendingBookId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(adminGet.status).toBe(HttpStatus.NOT_FOUND);
    const authorGet = await request(getServer())
      .get(`/author/books/${getPendingBookId()}`)
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`);
    expect(authorGet.status).toBe(HttpStatus.NOT_FOUND);
    const prismaProviderService: PrismaProviderService = getRunningApp().get(PrismaProviderService);
    const deletedRow = await prismaProviderService.book.findUnique({
      where: { id: getPendingBookId() },
    });
    expect(deletedRow?.deletedAt).not.toBeNull();
    const deleteAudit = await prismaProviderService.auditLog.findFirst({
      where: {
        action: AuditAction.BOOK_DELETED,
        subjectType: AuditSubjectType.BOOK,
        subjectId: getPendingBookId(),
      },
    });
    expect(deleteAudit).not.toBeNull();
  });
});
