import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookType } from '@/modules/book/enum/general.enum';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { EPUB_OCF } from '@/modules/book-processing/epub-ocf.constant';
import { BookPageSpreadRole } from '@/modules/book-processing/enum/general.enum';
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
    <dc:identifier id="uid">urn:uuid:fxl-e2e</dc:identifier>
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

function createPageXml(title: string, width: number, height: number): string {
  return `<html><head><title>${title}</title><meta name="viewport" content="width=${width}, height=${height}"/></head><body><h1>${title}</h1></body></html>`;
}

describe('Book EPUB fixed-layout extraction (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `epub-fxl-${Date.now()}@book.test`;
  const pairedSourceBytes = createEpubBytes(
    createPackageXml({
      extraMetadata: '<meta property="rendition:layout">pre-paginated</meta>',
      manifestItems: `
        <item id="p1" href="page1.xhtml" media-type="application/xhtml+xml"/>
        <item id="p2" href="page2.xhtml" media-type="application/xhtml+xml"/>
      `,
      spineItems: `
        <itemref idref="p1" properties="page-spread-left"/>
        <itemref idref="p2" properties="page-spread-right"/>
      `,
    }),
    [
      { name: 'OEBPS/page1.xhtml', data: Buffer.from(createPageXml('Left Page', 1200, 1600)) },
      { name: 'OEBPS/page2.xhtml', data: Buffer.from(createPageXml('Right Page', 1200, 1600)) },
    ],
  );
  const singleSourceBytes = createEpubBytes(
    createPackageXml({
      extraMetadata: `
        <meta property="rendition:layout">pre-paginated</meta>
        <meta property="rendition:spread">none</meta>
      `,
      manifestItems: '<item id="p1" href="only.xhtml" media-type="application/xhtml+xml"/>',
      spineItems: '<itemref idref="p1"/>',
    }),
    [{ name: 'OEBPS/only.xhtml', data: Buffer.from(createPageXml('One Page', 800, 600)) }],
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
  let accessToken: string | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
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

  it('Given a pre-paginated EPUB, When pages are extracted, Then spreads and dimensions are persisted', async () => {
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
        description: 'Used by EPUB fixed-layout e2e tests.',
        bookType: BookType.PICTURE_BOOK,
        ownerId: publisherResponse.body.user.id as number,
      });
    bookId = createdBook.id;
    const uploadResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${getAccessToken()}`)
      .attach('file', pairedSourceBytes, {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    const actualStructure = await getRunningApp()
      .get(BookProcessingService)
      .extractEpubFixedLayout(getBookId());
    expect(actualStructure.pages).toHaveLength(2);
    expect(actualStructure.pages[0]?.spreadRole).toBe(BookPageSpreadRole.LEFT);
    expect(actualStructure.pages[1]?.spreadRole).toBe(BookPageSpreadRole.RIGHT);
    expect(actualStructure.pages[0]?.width).toBe(1200);
    expect(actualStructure.pages[0]?.height).toBe(1600);
    expect(actualStructure.spreads).toHaveLength(1);
    expect(actualStructure.spreads[0]?.leftPageId).toBe(actualStructure.pages[0]?.id);
    expect(actualStructure.spreads[0]?.rightPageId).toBe(actualStructure.pages[1]?.id);
    const catalogBook = await getRunningApp().get(BookService).getBookById(getBookId());
    expect(catalogBook.title).toBe('Catalog Title');
  });

  it('Given a new source on the same book, When pages are extracted again, Then previous rows are replaced', async () => {
    const uploadResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${getAccessToken()}`)
      .attach('file', singleSourceBytes, {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    const actualStructure = await getRunningApp()
      .get(BookProcessingService)
      .extractEpubFixedLayout(getBookId());
    expect(actualStructure.pages).toHaveLength(1);
    expect(actualStructure.pages[0]?.spreadRole).toBe(BookPageSpreadRole.SINGLE);
    expect(actualStructure.pages[0]?.width).toBe(800);
    expect(actualStructure.spreads).toHaveLength(1);
    expect(actualStructure.spreads[0]?.centerPageId).toBe(actualStructure.pages[0]?.id);
  });

  it('Given a reflowable EPUB, When pages are extracted, Then the request is rejected', async () => {
    const uploadResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${getAccessToken()}`)
      .attach('file', reflowableBytes, {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    await expect(
      getRunningApp().get(BookProcessingService).extractEpubFixedLayout(getBookId()),
    ).rejects.toBeInstanceOf(BookProcessingNotFixedLayoutException);
  });
});
