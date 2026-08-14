import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookLayoutType, BookProcessingStatus, BookType } from '@/modules/book/enum/general.enum';
import { BookProcessingOrchestrationService } from '@/modules/book-processing/book-processing-orchestration.service';
import { EPUB_OCF } from '@/modules/book-processing/epub-ocf.constant';
import { ZipArchive } from '@/modules/book-processing/zip-archive.helper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';

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
    <dc:identifier id="uid">urn:uuid:orch-e2e</dc:identifier>
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

describe('Book processing orchestration (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `processing-orch-${Date.now()}@book.test`;
  const pdfBytes = Buffer.from('%PDF-1.4 orchestrated');
  const invalidEpubBytes = Buffer.from('not-an-epub');
  let app: INestApplication | undefined;
  let bookId: number | undefined;
  let pdfBookId: number | undefined;
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
      where: { book: { owner: { email: ownerEmail } } },
    });
    await prismaProviderService.bookSpread.deleteMany({
      where: { book: { owner: { email: ownerEmail } } },
    });
    await prismaProviderService.bookPage.deleteMany({
      where: { book: { owner: { email: ownerEmail } } },
    });
    await prismaProviderService.bookChapter.deleteMany({
      where: { book: { owner: { email: ownerEmail } } },
    });
    await prismaProviderService.bookSourceMetadata.deleteMany({
      where: { book: { owner: { email: ownerEmail } } },
    });
    await prismaProviderService.bookAsset.deleteMany({
      where: { book: { owner: { email: ownerEmail } } },
    });
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: ownerEmail } },
    });
    await prismaProviderService.user.deleteMany({ where: { email: ownerEmail } });
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

  function getAccessToken(): string {
    if (accessToken === undefined) {
      throw new Error('Access token was not created');
    }
    return accessToken;
  }

  it('Given a reflowable EPUB, When processing starts, Then the book becomes ready with chapters', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: ownerEmail,
      password,
    });
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);
    accessToken = publisherResponse.body.accessToken as string;
    const ownerId: number = publisherResponse.body.user.id as number;
    const createdBook = await getRunningApp().get(BookService).createBook({
      title: 'Catalog Title',
      description: 'Used by processing orchestration e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
    });
    bookId = createdBook.id;
    const pdfBook = await getRunningApp().get(BookService).createBook({
      title: 'PDF Catalog Title',
      description: 'Used by PDF orchestration e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
    });
    pdfBookId = pdfBook.id;
    const failedBook = await getRunningApp().get(BookService).createBook({
      title: 'Failed Catalog Title',
      description: 'Used by failed orchestration e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
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
    const actualBook = await getRunningApp()
      .get(BookProcessingOrchestrationService)
      .startProcessing(getBookId());
    expect(actualBook.processingStatus).toBe(BookProcessingStatus.READY);
    expect(actualBook.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualBook.title).toBe('Catalog Title');
    const prismaProviderService: PrismaProviderService = getRunningApp().get(PrismaProviderService);
    expect(await prismaProviderService.bookChapter.count({ where: { bookId: getBookId() } })).toBe(
      1,
    );
  });

  it('Given a PDF source, When processing starts, Then the book becomes ready without EPUB structure', async () => {
    if (pdfBookId === undefined) {
      throw new Error('PDF book was not created');
    }
    const uploadResponse = await request(getServer())
      .post(`/author/books/${pdfBookId}/source`)
      .set('Authorization', `Bearer ${getAccessToken()}`)
      .attach('file', pdfBytes, { filename: 'book.pdf', contentType: 'application/pdf' });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    const actualBook = await getRunningApp()
      .get(BookProcessingOrchestrationService)
      .startProcessing(pdfBookId);
    expect(actualBook.processingStatus).toBe(BookProcessingStatus.READY);
    expect(actualBook.layoutType).toBeNull();
    expect(actualBook.title).toBe('PDF Catalog Title');
    const prismaProviderService: PrismaProviderService = getRunningApp().get(PrismaProviderService);
    expect(await prismaProviderService.bookChapter.count({ where: { bookId: pdfBookId } })).toBe(0);
    expect(await prismaProviderService.bookPage.count({ where: { bookId: pdfBookId } })).toBe(0);
  });

  it('Given an invalid EPUB source, When processing starts, Then the book is marked failed', async () => {
    if (failedBookId === undefined) {
      throw new Error('Failed book was not created');
    }
    const uploadResponse = await request(getServer())
      .post(`/author/books/${failedBookId}/source`)
      .set('Authorization', `Bearer ${getAccessToken()}`)
      .attach('file', invalidEpubBytes, {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    const actualBook = await getRunningApp()
      .get(BookProcessingOrchestrationService)
      .startProcessing(failedBookId);
    expect(actualBook.processingStatus).toBe(BookProcessingStatus.FAILED);
    expect(actualBook.title).toBe('Failed Catalog Title');
  });
});
