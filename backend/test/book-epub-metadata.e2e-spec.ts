import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookType } from '@/modules/book/enum/general.enum';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
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

const PACKAGE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:metadata-e2e</dc:identifier>
    <dc:title>Harbor Lights</dc:title>
    <dc:language>en</dc:language>
    <dc:creator>Jane Author</dc:creator>
  </metadata>
  <manifest></manifest>
  <spine></spine>
</package>
`;

describe('Book EPUB metadata extraction (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `epub-metadata-${Date.now()}@book.test`;
  const epubBytes = ZipArchive.createStored([
    { name: EPUB_OCF.mimetypePath, data: Buffer.from(EPUB_OCF.mimetypeValue) },
    { name: EPUB_OCF.containerPath, data: Buffer.from(CONTAINER_XML) },
    { name: 'OEBPS/content.opf', data: Buffer.from(PACKAGE_XML) },
  ]);
  let app: INestApplication | undefined;
  let bookId: number | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
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

  it('Given a valid EPUB source, When metadata is extracted, Then OPF fields are preserved', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: ownerEmail,
      password,
    });
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);
    const createdBook = await getRunningApp()
      .get(BookService)
      .createBook({
        title: 'Catalog Title',
        description: 'Used by EPUB metadata e2e tests.',
        bookType: BookType.STANDARD_CHAPTER,
        ownerId: publisherResponse.body.user.id as number,
      });
    bookId = createdBook.id;
    const uploadResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${publisherResponse.body.accessToken}`)
      .attach('file', epubBytes, {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    const actualMetadata = await getRunningApp()
      .get(BookProcessingService)
      .extractEpubMetadata(getBookId());
    expect(actualMetadata.bookId).toBe(getBookId());
    expect(actualMetadata.epubVersion).toBe('3.0');
    expect(actualMetadata.identifier).toBe('urn:uuid:metadata-e2e');
    expect(actualMetadata.title).toBe('Harbor Lights');
    expect(actualMetadata.language).toBe('en');
    expect(actualMetadata.creator).toBe('Jane Author');
    const catalogBook = await getRunningApp().get(BookService).getBookById(getBookId());
    expect(catalogBook.title).toBe('Catalog Title');
  });
});
