import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { BookService } from '@/modules/book/book.service';
import { BookType } from '@/modules/book/enum/general.enum';
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
    <dc:identifier id="uid">urn:uuid:rejection-history-e2e</dc:identifier>
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

describe('Book rejection history (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `rejection-history-owner-${Date.now()}@book.test`;
  const otherEmail = `rejection-history-other-${Date.now()}@book.test`;
  const adminEmail = `rejection-history-admin-${Date.now()}@book.test`;
  const emails = [ownerEmail, otherEmail, adminEmail];
  const firstRejectionReason = 'Cover art is unreadable at catalog size.';
  const secondRejectionReason = 'Chapter one still has placeholder copy.';
  let app: INestApplication | undefined;
  let pendingBookId: number | undefined;
  let rejectedBookId: number | undefined;
  let ownerUserId: number | undefined;
  let ownerAccessToken: string | undefined;
  let otherAccessToken: string | undefined;
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

  function getPendingBookId(): number {
    if (pendingBookId === undefined) {
      throw new Error('Pending book was not created');
    }
    return pendingBookId;
  }

  function getRejectedBookId(): number {
    if (rejectedBookId === undefined) {
      throw new Error('Rejected book was not created');
    }
    return rejectedBookId;
  }

  function getOwnerUserId(): number {
    if (ownerUserId === undefined) {
      throw new Error('Owner user was not created');
    }
    return ownerUserId;
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
      description: 'Used by rejection-history e2e tests.',
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

  it('Given no access token, When rejection history is listed, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/admin/books/1/rejection-history');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given a book that was never rejected, When history is listed, Then an empty page is returned', async () => {
    const owner = await registerPublisher(ownerEmail);
    ownerAccessToken = owner.accessToken;
    ownerUserId = owner.userId;
    const other = await registerPublisher(otherEmail);
    otherAccessToken = other.accessToken;
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
    const pendingBook = await getRunningApp().get(BookService).createBook({
      title: 'Never Rejected Title',
      description: 'Used by rejection-history e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: owner.userId,
    });
    pendingBookId = pendingBook.id;
    const ownerResponse = await request(getServer())
      .get(`/author/books/${getPendingBookId()}/rejection-history`)
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`);
    expect(ownerResponse.status).toBe(HttpStatus.OK);
    expect(ownerResponse.body).toEqual({ rejections: [], total: 0 });
    const adminResponse = await request(getServer())
      .get(`/admin/books/${getPendingBookId()}/rejection-history`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(adminResponse.status).toBe(HttpStatus.OK);
    expect(adminResponse.body).toEqual({ rejections: [], total: 0 });
  });

  it('Given a rejected book, When admin and owner list history, Then the book_rejected rows are returned', async () => {
    rejectedBookId = await submitReflowableBook(
      'Reject Catalog Title',
      getOwnerUserId(),
      getOwnerAccessToken(),
    );
    const rejectResponse = await request(getServer())
      .post(`/admin/books/${getRejectedBookId()}/reject`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ reason: firstRejectionReason });
    expect(rejectResponse.status).toBe(HttpStatus.OK);
    const adminResponse = await request(getServer())
      .get(`/admin/books/${getRejectedBookId()}/rejection-history`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(adminResponse.status).toBe(HttpStatus.OK);
    expect(adminResponse.body.total).toBe(1);
    expect(adminResponse.body.rejections).toHaveLength(1);
    expect(adminResponse.body.rejections[0]).toEqual(
      expect.objectContaining({
        action: AuditAction.BOOK_REJECTED,
        subjectType: AuditSubjectType.BOOK,
        subjectId: getRejectedBookId(),
        reason: firstRejectionReason,
      }),
    );
    const ownerResponse = await request(getServer())
      .get(`/author/books/${getRejectedBookId()}/rejection-history`)
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`);
    expect(ownerResponse.status).toBe(HttpStatus.OK);
    expect(ownerResponse.body.total).toBe(1);
    expect(ownerResponse.body.rejections[0].reason).toBe(firstRejectionReason);
  });

  it('Given another publisher session, When that publisher lists history, Then the book is hidden', async () => {
    const actualResponse = await request(getServer())
      .get(`/author/books/${getRejectedBookId()}/rejection-history`)
      .set('Authorization', `Bearer ${getOtherAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given a missing book, When an admin lists history, Then the book is hidden', async () => {
    const actualResponse = await request(getServer())
      .get('/admin/books/999999/rejection-history')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given a second rejection after resubmit, When history is listed, Then both rows are returned newest first', async () => {
    const submitResponse = await request(getServer())
      .post(`/author/books/${getRejectedBookId()}/submit-for-review`)
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`);
    expect(submitResponse.status).toBe(HttpStatus.OK);
    const rejectResponse = await request(getServer())
      .post(`/admin/books/${getRejectedBookId()}/reject`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ reason: secondRejectionReason });
    expect(rejectResponse.status).toBe(HttpStatus.OK);
    const actualResponse = await request(getServer())
      .get(`/author/books/${getRejectedBookId()}/rejection-history`)
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.total).toBe(2);
    expect(actualResponse.body.rejections).toHaveLength(2);
    expect(actualResponse.body.rejections[0].reason).toBe(secondRejectionReason);
    expect(actualResponse.body.rejections[0].action).toBe(AuditAction.BOOK_REJECTED);
    expect(actualResponse.body.rejections[1].reason).toBe(firstRejectionReason);
    expect(actualResponse.body.rejections[1].action).toBe(AuditAction.BOOK_REJECTED);
  });
});
