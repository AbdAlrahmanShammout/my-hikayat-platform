import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookType } from '@/modules/book/enum/general.enum';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { EPUB_OCF } from '@/modules/book-processing/epub-ocf.constant';
import { BookProcessingInvalidPdfException } from '@/modules/book-processing/exceptions/book-processing-invalid-pdf.exception';
import { BookProcessingMissingSourceException } from '@/modules/book-processing/exceptions/book-processing-missing-source.exception';
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

const PACKAGE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:pdf-e2e</dc:identifier>
    <dc:title>PDF Fixture</dc:title>
    <dc:language>en</dc:language>
  </metadata>
  <manifest></manifest>
  <spine></spine>
</package>
`;

describe('Book PDF source ingest (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `pdf-ingest-${Date.now()}@book.test`;
  const pdfBytes = Buffer.from('%PDF-1.4 stored-source');
  const epubBytes = ZipArchive.createStored([
    { name: EPUB_OCF.mimetypePath, data: Buffer.from(EPUB_OCF.mimetypeValue) },
    { name: EPUB_OCF.containerPath, data: Buffer.from(CONTAINER_XML) },
    { name: 'OEBPS/content.opf', data: Buffer.from(PACKAGE_XML) },
  ]);
  let app: INestApplication | undefined;
  let bookId: number | undefined;
  let accessToken: string | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.bookAsset.deleteMany({
      where: { book: { owner: { email: ownerEmail } } },
    });
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: ownerEmail } },
    });
    await deleteUsersByEmail(prismaProviderService, ownerEmail);
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

  it('Given a catalog book without a source, When PDF ingest runs, Then it fails', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: ownerEmail,
      password,
    });
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);
    accessToken = publisherResponse.body.accessToken as string;
    const createdBook = await getRunningApp()
      .get(BookService)
      .createBook({
        title: 'Catalog Title',
        description: 'Used by PDF ingest e2e tests.',
        bookType: BookType.STANDARD_CHAPTER,
        ownerId: publisherResponse.body.user.id as number,
      });
    bookId = createdBook.id;
    await expect(
      getRunningApp().get(BookProcessingService).ingestPdfSource(getBookId()),
    ).rejects.toBeInstanceOf(BookProcessingMissingSourceException);
  });

  it('Given an encrypted PDF source, When ingest runs, Then the header is accepted and catalog title is unchanged', async () => {
    const uploadResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${getAccessToken()}`)
      .attach('file', pdfBytes, { filename: 'book.pdf', contentType: 'application/pdf' });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    await expect(
      getRunningApp().get(BookProcessingService).ingestPdfSource(getBookId()),
    ).resolves.toBeUndefined();
    const catalogBook = await getRunningApp().get(BookService).getBookById(getBookId());
    expect(catalogBook.title).toBe('Catalog Title');
    expect(catalogBook.layoutType).toBeNull();
    const prismaProviderService: PrismaProviderService = getRunningApp().get(PrismaProviderService);
    expect(await prismaProviderService.bookChapter.count({ where: { bookId: getBookId() } })).toBe(
      0,
    );
    expect(await prismaProviderService.bookPage.count({ where: { bookId: getBookId() } })).toBe(0);
  });

  it('Given an EPUB source, When PDF ingest runs, Then it is rejected', async () => {
    const uploadResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${getAccessToken()}`)
      .attach('file', epubBytes, {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    await expect(
      getRunningApp().get(BookProcessingService).ingestPdfSource(getBookId()),
    ).rejects.toBeInstanceOf(BookProcessingInvalidPdfException);
  });
});
