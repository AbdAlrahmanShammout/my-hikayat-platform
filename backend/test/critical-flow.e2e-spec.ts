import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { BookService } from '@/modules/book/book.service';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { EPUB_OCF } from '@/modules/book-processing/epub-ocf.constant';
import { ZipArchive } from '@/modules/book-processing/zip-archive.helper';
import { PlanKind, SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { UserRole } from '@/modules/user/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { MEMORY_STORAGE_URI_SCHEME } from '@/providers/storage/memory/consts';

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
    <dc:identifier id="uid">urn:uuid:critical-flow-e2e</dc:identifier>
    <dc:title>Critical Harbor Lights</dc:title>
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

describe('Part 1 critical flow (e2e)', () => {
  const password = 'correct-horse-battery';
  const authorEmail = `critical-author-${Date.now()}@book.test`;
  const readerEmail = `critical-reader-${Date.now()}@book.test`;
  const adminEmail = `critical-admin-${Date.now()}@book.test`;
  const emails = [authorEmail, readerEmail, adminEmail];
  const bookTitle = 'Critical Harbor Lights';
  let app: INestApplication | undefined;
  let authorUserId: number | undefined;
  let readerUserId: number | undefined;
  let adminUserId: number | undefined;
  let bookId: number | undefined;
  let authorAccessToken: string | undefined;
  let readerAccessToken: string | undefined;
  let adminAccessToken: string | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.readingSession.deleteMany({
      where: {
        OR: [{ user: { email: { in: emails } } }, { book: { owner: { email: { in: emails } } } }],
      },
    });
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

  function getAuthorAccessToken(): string {
    if (authorAccessToken === undefined) {
      throw new Error('Author access token was not initialized');
    }
    return authorAccessToken;
  }

  function getReaderAccessToken(): string {
    if (readerAccessToken === undefined) {
      throw new Error('Reader access token was not initialized');
    }
    return readerAccessToken;
  }

  function getAdminAccessToken(): string {
    if (adminAccessToken === undefined) {
      throw new Error('Admin access token was not initialized');
    }
    return adminAccessToken;
  }

  function getBookId(): number {
    if (bookId === undefined) {
      throw new Error('Book id was not initialized');
    }
    return bookId;
  }

  function getAuthorUserId(): number {
    if (authorUserId === undefined) {
      throw new Error('Author user id was not initialized');
    }
    return authorUserId;
  }

  function getReaderUserId(): number {
    if (readerUserId === undefined) {
      throw new Error('Reader user id was not initialized');
    }
    return readerUserId;
  }

  function getAdminUserId(): number {
    if (adminUserId === undefined) {
      throw new Error('Admin user id was not initialized');
    }
    return adminUserId;
  }

  it('Given a new user, When they become a publisher and submit an EPUB, Then the book is in review', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: authorEmail,
      password,
    });
    expect(registerResponse.status).toBe(HttpStatus.CREATED);
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);
    expect(publisherResponse.status).toBe(HttpStatus.OK);
    expect(publisherResponse.body.user.role).toBe(UserRole.AUTHOR);
    authorAccessToken = publisherResponse.body.accessToken as string;
    authorUserId = publisherResponse.body.user.id as number;
    const createdBook = await getRunningApp().get(BookService).createBook({
      title: bookTitle,
      description: 'Used by the Part 1 critical-flow e2e.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: getAuthorUserId(),
    });
    bookId = createdBook.id;
    const uploadResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${getAuthorAccessToken()}`)
      .attach('file', createReflowableEpubBytes(), {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    const submitResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/submit-for-review`)
      .set('Authorization', `Bearer ${getAuthorAccessToken()}`);
    expect(submitResponse.status).toBe(HttpStatus.OK);
    expect(submitResponse.body.publishingStatus).toBe(BookPublishingStatus.IN_REVIEW);
    expect(submitResponse.body.processingStatus).toBe(BookProcessingStatus.READY);
    expect(submitResponse.body.layoutType).toBe(BookLayoutType.REFLOWABLE);
  });

  it('Given an admin, When they approve the book, Then it is published in the catalog', async () => {
    const adminRegister = await request(getServer()).post('/auth/register').send({
      email: adminEmail,
      password,
    });
    expect(adminRegister.status).toBe(HttpStatus.CREATED);
    adminUserId = adminRegister.body.user.id as number;
    const prismaProviderService: PrismaProviderService = getRunningApp().get(PrismaProviderService);
    await prismaProviderService.user.update({
      where: { id: getAdminUserId() },
      data: { role: UserRole.ADMIN },
    });
    const loginResponse = await request(getServer()).post('/auth/login').send({
      email: adminEmail,
      password,
    });
    adminAccessToken = loginResponse.body.accessToken as string;
    const approveResponse = await request(getServer())
      .post(`/admin/books/${getBookId()}/approve`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(approveResponse.status).toBe(HttpStatus.OK);
    expect(approveResponse.body.publishingStatus).toBe(BookPublishingStatus.APPROVED);
    expect(approveResponse.body.publishedAt).toEqual(expect.any(String));
    const readerRegister = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    expect(readerRegister.status).toBe(HttpStatus.CREATED);
    readerUserId = readerRegister.body.user.id as number;
    readerAccessToken = readerRegister.body.accessToken as string;
    const catalogResponse = await request(getServer())
      .get(`/reader/catalog/${getBookId()}`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(catalogResponse.status).toBe(HttpStatus.OK);
    expect(catalogResponse.body.title).toBe(bookTitle);
    const searchResponse = await request(getServer())
      .get('/reader/search')
      .query({ title: bookTitle })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(searchResponse.status).toBe(HttpStatus.OK);
    expect(searchResponse.body.books).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: getBookId(), title: bookTitle })]),
    );
  });

  it('Given an unpaid reader, When they request a delivery grant, Then full-book access is denied', async () => {
    const actualResponse = await request(getServer())
      .post(`/reader/books/${getBookId()}/delivery-grant`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('FULL_BOOK_ACCESS_DENIED');
  });

  it('Given checkout and a Stripe webhook, When the reader is paid, Then they can download, read, and search', async () => {
    const checkoutResponse = await request(getServer())
      .post('/reader/billing/checkout')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      });
    expect(checkoutResponse.status).toBe(HttpStatus.OK);
    expect(checkoutResponse.body.url).toEqual(expect.any(String));
    const webhookResponse = await request(getServer())
      .post('/webhooks/stripe')
      .set('stripe-signature', 'test')
      .send({
        id: 'evt_critical_checkout',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: `cs_memory_${getReaderUserId()}`,
            customer: `cus_memory_${getReaderUserId()}`,
            subscription: `sub_memory_${getReaderUserId()}`,
            client_reference_id: String(getReaderUserId()),
          },
        },
      });
    expect(webhookResponse.status).toBe(HttpStatus.OK);
    const subscriptionResponse = await request(getServer())
      .get('/reader/billing/subscription')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(subscriptionResponse.status).toBe(HttpStatus.OK);
    expect(subscriptionResponse.body.status).toBe(SubscriptionStatus.ACTIVE);
    expect(subscriptionResponse.body.plan.kind).toBe(PlanKind.MONTHLY_PAID);
    const grantResponse = await request(getServer())
      .post(`/reader/books/${getBookId()}/delivery-grant`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(grantResponse.status).toBe(HttpStatus.OK);
    expect(grantResponse.body.isEncrypted).toBe(true);
    expect(grantResponse.body.kind).toBe(BookAssetKind.SOURCE);
    expect(grantResponse.body.url).toMatch(new RegExp(`^${MEMORY_STORAGE_URI_SCHEME}://`));
    expect(grantResponse.body).not.toHaveProperty('storageKey');
    const progressResponse = await request(getServer())
      .put(`/reader/books/${getBookId()}/progress`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 0, scrollOffset: 24 });
    expect(progressResponse.status).toBe(HttpStatus.OK);
    expect(progressResponse.body.spineIndex).toBe(0);
    const sessionResponse = await request(getServer())
      .post(`/reader/books/${getBookId()}/sessions`)
      .set('Authorization', `Bearer ${getReaderAccessToken()}`)
      .send({ spineIndex: 0, scrollOffset: 24 });
    expect(sessionResponse.status).toBe(HttpStatus.CREATED);
    const inBookResponse = await request(getServer())
      .get(`/reader/search/${getBookId()}`)
      .query({ q: 'Harbor' })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(inBookResponse.status).toBe(HttpStatus.OK);
    expect(inBookResponse.body.total).toBeGreaterThan(0);
  });

  it('Given publishing actions, When an admin lists audit logs, Then submit and approve are recorded', async () => {
    const submitAudit = await request(getServer())
      .get('/admin/audit-logs')
      .query({
        action: AuditAction.BOOK_SUBMITTED_FOR_REVIEW,
        subjectId: getBookId(),
      })
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(submitAudit.status).toBe(HttpStatus.OK);
    expect(submitAudit.body.auditLogs[0]).toEqual(
      expect.objectContaining({
        actorUserId: getAuthorUserId(),
        action: AuditAction.BOOK_SUBMITTED_FOR_REVIEW,
        subjectType: AuditSubjectType.BOOK,
        subjectId: getBookId(),
      }),
    );
    const approveAudit = await request(getServer())
      .get('/admin/audit-logs')
      .query({
        action: AuditAction.BOOK_APPROVED,
        subjectId: getBookId(),
      })
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(approveAudit.status).toBe(HttpStatus.OK);
    expect(approveAudit.body.auditLogs[0]).toEqual(
      expect.objectContaining({
        actorUserId: getAdminUserId(),
        action: AuditAction.BOOK_APPROVED,
        subjectType: AuditSubjectType.BOOK,
        subjectId: getBookId(),
      }),
    );
  });
});
