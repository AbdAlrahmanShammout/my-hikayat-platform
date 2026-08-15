import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookType } from '@/modules/book/enum/general.enum';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { EPUB_OCF } from '@/modules/book-processing/epub-ocf.constant';
import { BookProcessingMissingPagesException } from '@/modules/book-processing/exceptions/book-processing-missing-pages.exception';
import { BookProcessingNotFixedLayoutException } from '@/modules/book-processing/exceptions/book-processing-not-fixed-layout.exception';
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

function createPackageXml(input: {
  readonly extraMetadata?: string;
  readonly manifestItems: string;
  readonly spineItems: string;
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:fxl-text-e2e</dc:identifier>
    <dc:title>Harbor Lights</dc:title>
    <dc:language>en</dc:language>
    ${input.extraMetadata ?? ''}
  </metadata>
  <manifest>
    ${input.manifestItems}
  </manifest>
  <spine>
    ${input.spineItems}
  </spine>
</package>
`;
}

function createEpubBytes(
  packageXml: string,
  extraEntries: { name: string; data: Buffer }[],
): Buffer {
  return ZipArchive.createStored([
    { name: EPUB_OCF.mimetypePath, data: Buffer.from(EPUB_OCF.mimetypeValue) },
    { name: EPUB_OCF.containerPath, data: Buffer.from(CONTAINER_XML) },
    { name: 'OEBPS/content.opf', data: Buffer.from(packageXml) },
    ...extraEntries,
  ]);
}

function createTextPageXml(text: string): string {
  return `<html>
    <head><title>${text}</title><meta name="viewport" content="width=1200, height=1600"/></head>
    <body>
      <svg><text x="120" y="80">${text}</text></svg>
      <div style="position:absolute; left:200px; top:400px; width:180px; height:24px">${text}</div>
    </body>
  </html>`;
}

describe('Book EPUB fixed-layout text extraction (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `epub-fxl-text-${Date.now()}@book.test`;
  const harborBytes = createEpubBytes(
    createPackageXml({
      extraMetadata: '<meta property="rendition:layout">pre-paginated</meta>',
      manifestItems: '<item id="p1" href="page1.xhtml" media-type="application/xhtml+xml"/>',
      spineItems: '<itemref idref="p1"/>',
    }),
    [{ name: 'OEBPS/page1.xhtml', data: Buffer.from(createTextPageXml('Harbor')) }],
  );
  const beaconBytes = createEpubBytes(
    createPackageXml({
      extraMetadata: '<meta property="rendition:layout">pre-paginated</meta>',
      manifestItems: '<item id="p1" href="page1.xhtml" media-type="application/xhtml+xml"/>',
      spineItems: '<itemref idref="p1"/>',
    }),
    [{ name: 'OEBPS/page1.xhtml', data: Buffer.from(createTextPageXml('Beacon')) }],
  );
  const reflowableBytes = createEpubBytes(
    createPackageXml({
      manifestItems: '<item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>',
      spineItems: '<itemref idref="c1"/>',
    }),
    [
      {
        name: 'OEBPS/chapter1.xhtml',
        data: Buffer.from('<html><body><h1>Chapter</h1><p>Reflowable text.</p></body></html>'),
      },
    ],
  );
  let app: INestApplication | undefined;
  let bookId: number | undefined;
  let missingPagesBookId: number | undefined;
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

  it('Given extracted pages, When text is extracted, Then searchable runs are persisted', async () => {
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
      description: 'Used by EPUB fixed-layout text e2e tests.',
      bookType: BookType.PICTURE_BOOK,
      ownerId,
    });
    bookId = createdBook.id;
    const missingPagesBook = await getRunningApp().get(BookService).createBook({
      title: 'Missing Pages Book',
      description: 'Used to assert text extraction requires pages.',
      bookType: BookType.PICTURE_BOOK,
      ownerId,
    });
    missingPagesBookId = missingPagesBook.id;
    const uploadResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${getAccessToken()}`)
      .attach('file', harborBytes, {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    await getRunningApp().get(BookProcessingService).extractEpubFixedLayout(getBookId());
    const actualLayers = await getRunningApp()
      .get(BookProcessingService)
      .extractEpubFixedLayoutText(getBookId());
    expect(actualLayers).toHaveLength(1);
    expect(actualLayers[0]?.contentText).toContain('Harbor');
    expect(actualLayers[0]?.runs?.length).toBeGreaterThanOrEqual(1);
    expect(actualLayers[0]?.runs?.[0]).toEqual(
      expect.objectContaining({ text: 'Harbor', x: 120, y: 80 }),
    );
    const catalogBook = await getRunningApp().get(BookService).getBookById(getBookId());
    expect(catalogBook.title).toBe('Catalog Title');
  });

  it('Given a new source on the same book, When text is extracted again, Then previous rows are replaced', async () => {
    const uploadResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${getAccessToken()}`)
      .attach('file', beaconBytes, {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    await getRunningApp().get(BookProcessingService).extractEpubFixedLayout(getBookId());
    const actualLayers = await getRunningApp()
      .get(BookProcessingService)
      .extractEpubFixedLayoutText(getBookId());
    expect(actualLayers).toHaveLength(1);
    expect(actualLayers[0]?.contentText).toContain('Beacon');
    expect(actualLayers[0]?.runs?.[0]?.text).toBe('Beacon');
  });

  it('Given a fixed-layout source without pages, When text is extracted, Then the request is rejected', async () => {
    if (missingPagesBookId === undefined) {
      throw new Error('Missing-pages book was not created');
    }
    const uploadResponse = await request(getServer())
      .post(`/author/books/${missingPagesBookId}/source`)
      .set('Authorization', `Bearer ${getAccessToken()}`)
      .attach('file', harborBytes, {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    await expect(
      getRunningApp().get(BookProcessingService).extractEpubFixedLayoutText(missingPagesBookId),
    ).rejects.toBeInstanceOf(BookProcessingMissingPagesException);
  });

  it('Given a reflowable EPUB, When text is extracted, Then the request is rejected', async () => {
    const uploadResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${getAccessToken()}`)
      .attach('file', reflowableBytes, {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    await expect(
      getRunningApp().get(BookProcessingService).extractEpubFixedLayoutText(getBookId()),
    ).rejects.toBeInstanceOf(BookProcessingNotFixedLayoutException);
  });
});
