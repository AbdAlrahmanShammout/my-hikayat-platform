import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookLayoutType, BookType } from '@/modules/book/enum/general.enum';
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

function createPackageXml(extraMetadata = ''): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:layout-e2e</dc:identifier>
    <dc:title>Harbor Lights</dc:title>
    <dc:language>en</dc:language>
    ${extraMetadata}
  </metadata>
  <manifest></manifest>
  <spine></spine>
</package>
`;
}

function createEpubBytes(extraMetadata = ''): Buffer {
  return ZipArchive.createStored([
    { name: EPUB_OCF.mimetypePath, data: Buffer.from(EPUB_OCF.mimetypeValue) },
    { name: EPUB_OCF.containerPath, data: Buffer.from(CONTAINER_XML) },
    { name: 'OEBPS/content.opf', data: Buffer.from(createPackageXml(extraMetadata)) },
  ]);
}

describe('Book EPUB layout detection (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `epub-layout-${Date.now()}@book.test`;
  const reflowableBytes = createEpubBytes();
  const fixedLayoutBytes = createEpubBytes(
    '<meta property="rendition:layout">pre-paginated</meta>',
  );
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

  it('Given EPUB sources, When layout is detected, Then Book.layoutType is persisted', async () => {
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
        description: 'Used by EPUB layout e2e tests.',
        bookType: BookType.STANDARD_CHAPTER,
        ownerId: publisherResponse.body.user.id as number,
      });
    bookId = createdBook.id;
    const reflowableUpload = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${publisherResponse.body.accessToken}`)
      .attach('file', reflowableBytes, {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(reflowableUpload.status).toBe(HttpStatus.CREATED);
    const reflowableBook = await getRunningApp()
      .get(BookProcessingService)
      .detectEpubLayout(getBookId());
    expect(reflowableBook.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(reflowableBook.title).toBe('Catalog Title');
    const fixedLayoutUpload = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${publisherResponse.body.accessToken}`)
      .attach('file', fixedLayoutBytes, {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(fixedLayoutUpload.status).toBe(HttpStatus.CREATED);
    const fixedLayoutBook = await getRunningApp()
      .get(BookProcessingService)
      .detectEpubLayout(getBookId());
    expect(fixedLayoutBook.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
    expect(fixedLayoutBook.title).toBe('Catalog Title');
    expect(fixedLayoutBook.bookType).toBe(BookType.STANDARD_CHAPTER);
  });
});
