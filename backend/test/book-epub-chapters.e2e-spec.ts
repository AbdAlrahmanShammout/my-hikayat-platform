import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookType } from '@/modules/book/enum/general.enum';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { EPUB_OCF } from '@/modules/book-processing/epub-ocf.constant';
import { BookProcessingNotReflowableException } from '@/modules/book-processing/exceptions/book-processing-not-reflowable.exception';
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
    <dc:identifier id="uid">urn:uuid:chapters-e2e</dc:identifier>
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

describe('Book EPUB chapter extraction (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `epub-chapters-${Date.now()}@book.test`;
  const firstSourceBytes = createEpubBytes(
    createPackageXml({
      manifestItems: `
        <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
        <item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
        <item id="c2" href="chapter2.xhtml" media-type="application/xhtml+xml"/>
      `,
      spineItems: `
        <itemref idref="c1"/>
        <itemref idref="c2"/>
        <itemref idref="nav" linear="no"/>
      `,
    }),
    [
      {
        name: 'OEBPS/nav.xhtml',
        data: Buffer.from(`<html><body><nav epub:type="toc">
          <ol>
            <li><a href="chapter1.xhtml">The Harbor</a></li>
            <li><a href="chapter2.xhtml">The Storm</a></li>
          </ol>
        </nav></body></html>`),
      },
      {
        name: 'OEBPS/chapter1.xhtml',
        data: Buffer.from('<html><body><p>First chapter text.</p></body></html>'),
      },
      {
        name: 'OEBPS/chapter2.xhtml',
        data: Buffer.from('<html><body><p>Second chapter text.</p></body></html>'),
      },
    ],
  );
  const replacedSourceBytes = createEpubBytes(
    createPackageXml({
      manifestItems: '<item id="c1" href="only.xhtml" media-type="application/xhtml+xml"/>',
      spineItems: '<itemref idref="c1"/>',
    }),
    [
      {
        name: 'OEBPS/only.xhtml',
        data: Buffer.from('<html><body><h1>One Chapter</h1><p>Replacement text.</p></body></html>'),
      },
    ],
  );
  const fixedLayoutBytes = createEpubBytes(
    createPackageXml({
      extraMetadata: '<meta property="rendition:layout">pre-paginated</meta>',
      manifestItems: '<item id="p1" href="page1.xhtml" media-type="application/xhtml+xml"/>',
      spineItems: '<itemref idref="p1"/>',
    }),
    [
      {
        name: 'OEBPS/page1.xhtml',
        data: Buffer.from('<html><body><p>A fixed page.</p></body></html>'),
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

  it('Given a reflowable EPUB, When chapters are extracted, Then spine order and text are persisted', async () => {
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
        description: 'Used by EPUB chapter e2e tests.',
        bookType: BookType.STANDARD_CHAPTER,
        ownerId: publisherResponse.body.user.id as number,
      });
    bookId = createdBook.id;
    const uploadResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${getAccessToken()}`)
      .attach('file', firstSourceBytes, {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    const actualChapters = await getRunningApp()
      .get(BookProcessingService)
      .extractEpubChapters(getBookId());
    expect(actualChapters.map((chapter) => chapter.title)).toEqual(['The Harbor', 'The Storm']);
    expect(actualChapters.map((chapter) => chapter.contentText)).toEqual([
      'First chapter text.',
      'Second chapter text.',
    ]);
    expect(actualChapters.map((chapter) => chapter.spineIndex)).toEqual([0, 1]);
    const catalogBook = await getRunningApp().get(BookService).getBookById(getBookId());
    expect(catalogBook.title).toBe('Catalog Title');
  });

  it('Given a new source on the same book, When chapters are extracted again, Then previous rows are replaced', async () => {
    const uploadResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${getAccessToken()}`)
      .attach('file', replacedSourceBytes, {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    const actualChapters = await getRunningApp()
      .get(BookProcessingService)
      .extractEpubChapters(getBookId());
    expect(actualChapters).toHaveLength(1);
    expect(actualChapters[0]?.title).toBe('One Chapter');
    expect(actualChapters[0]?.contentText).toBe('One Chapter Replacement text.');
  });

  it('Given a pre-paginated EPUB, When chapters are extracted, Then the request is rejected', async () => {
    const uploadResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${getAccessToken()}`)
      .attach('file', fixedLayoutBytes, {
        filename: 'book.epub',
        contentType: 'application/epub+zip',
      });
    expect(uploadResponse.status).toBe(HttpStatus.CREATED);
    await expect(
      getRunningApp().get(BookProcessingService).extractEpubChapters(getBookId()),
    ).rejects.toBeInstanceOf(BookProcessingNotReflowableException);
  });
});
