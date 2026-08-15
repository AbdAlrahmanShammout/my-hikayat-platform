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
    <dc:identifier id="uid">urn:uuid:submit-e2e</dc:identifier>
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

describe('Book submit for review (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `submit-owner-${Date.now()}@book.test`;
  const otherEmail = `submit-other-${Date.now()}@book.test`;
  const readerEmail = `submit-reader-${Date.now()}@book.test`;
  const emails = [ownerEmail, otherEmail, readerEmail];
  const invalidEpubBytes = Buffer.from('not-an-epub');
  let app: INestApplication | undefined;
  let bookId: number | undefined;
  let failedBookId: number | undefined;
  let accessToken: string | undefined;

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

  function getBookId(): number {
    if (bookId === undefined) {
      throw new Error('Book was not created');
    }
    return bookId;
  }

  function getFailedBookId(): number {
    if (failedBookId === undefined) {
      throw new Error('Failed book was not created');
    }
    return failedBookId;
  }

  function getAccessToken(): string {
    if (accessToken === undefined) {
      throw new Error('Access token was not created');
    }
    return accessToken;
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

  it('Given no access token, When a book is submitted for review, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).post('/author/books/1/submit-for-review');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given a reflowable EPUB, When the owner submits for review, Then the book enters review ready', async () => {
    const owner = await registerPublisher(ownerEmail);
    accessToken = owner.accessToken;
    const createdBook = await getRunningApp().get(BookService).createBook({
      title: 'Catalog Title',
      description: 'Used by submit-for-review e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: owner.userId,
    });
    bookId = createdBook.id;
    const failedBook = await getRunningApp().get(BookService).createBook({
      title: 'Failed Catalog Title',
      description: 'Used by failed submit-for-review e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: owner.userId,
    });
    failedBookId = failedBook.id;
    const uploadResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${getAccessToken()}`)
      .attach('file', createReflowableEpubBytes(), {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    const actualResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/submit-for-review`)
      .set('Authorization', `Bearer ${getAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.publishingStatus).toBe(BookPublishingStatus.IN_REVIEW);
    expect(actualResponse.body.processingStatus).toBe(BookProcessingStatus.READY);
    expect(actualResponse.body.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualResponse.body.title).toBe('Catalog Title');
  });

  it('Given a reader session, When a book is submitted for review, Then access is denied', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    const actualResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/submit-for-review`)
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('ACCESS_DENIED');
  });

  it('Given another publisher, When they submit a foreign book, Then the book is hidden', async () => {
    const other = await registerPublisher(otherEmail);
    const actualResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/submit-for-review`)
      .set('Authorization', `Bearer ${other.accessToken}`);
    expect(actualResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(actualResponse.body.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('Given an invalid EPUB source, When the owner submits for review, Then publishing stays pending', async () => {
    const uploadResponse = await request(getServer())
      .post(`/author/books/${getFailedBookId()}/source`)
      .set('Authorization', `Bearer ${getAccessToken()}`)
      .attach('file', invalidEpubBytes, {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    const actualResponse = await request(getServer())
      .post(`/author/books/${getFailedBookId()}/submit-for-review`)
      .set('Authorization', `Bearer ${getAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('BOOK_NOT_READY_FOR_REVIEW');
    const failedBook = await getRunningApp().get(BookService).getBookById(getFailedBookId());
    expect(failedBook.publishingStatus).toBe(BookPublishingStatus.PENDING);
    expect(failedBook.processingStatus).toBe(BookProcessingStatus.FAILED);
    expect(failedBook.title).toBe('Failed Catalog Title');
  });

  it('Given a book already in review, When it is submitted again, Then the publishing transition is rejected', async () => {
    const actualResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/submit-for-review`)
      .set('Authorization', `Bearer ${getAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('BOOK_INVALID_PUBLISHING_TRANSITION');
  });
});
