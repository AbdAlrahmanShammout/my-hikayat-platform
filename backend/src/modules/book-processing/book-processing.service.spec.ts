import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookAssetService } from '@/modules/book-asset/book-asset.service';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { EPUB_OCF } from '@/modules/book-processing/epub-ocf.constant';
import { BookSourceMetadataEntity } from '@/modules/book-processing/entity/book-source-metadata.entity';
import { BookChapterEntity } from '@/modules/book-processing/entity/book-chapter.entity';
import { BookPageEntity } from '@/modules/book-processing/entity/book-page.entity';
import { BookPageTextLayerEntity } from '@/modules/book-processing/entity/book-page-text-layer.entity';
import { BookSpreadEntity } from '@/modules/book-processing/entity/book-spread.entity';
import { BookPageSpreadRole } from '@/modules/book-processing/enum/general.enum';
import { BookProcessingInvalidEpubException } from '@/modules/book-processing/exceptions/book-processing-invalid-epub.exception';
import { BookProcessingInvalidPdfException } from '@/modules/book-processing/exceptions/book-processing-invalid-pdf.exception';
import { BookProcessingInvalidSourceException } from '@/modules/book-processing/exceptions/book-processing-invalid-source.exception';
import { BookProcessingMissingPagesException } from '@/modules/book-processing/exceptions/book-processing-missing-pages.exception';
import { BookProcessingMissingSourceException } from '@/modules/book-processing/exceptions/book-processing-missing-source.exception';
import { BookProcessingNotFixedLayoutException } from '@/modules/book-processing/exceptions/book-processing-not-fixed-layout.exception';
import { BookProcessingNotReflowableException } from '@/modules/book-processing/exceptions/book-processing-not-reflowable.exception';
import { ZipArchive } from '@/modules/book-processing/zip-archive.helper';
import { EncryptionManagerService } from '@/providers/encryption/encryption-manager.service';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

import { BookProcessingService } from './book-processing.service';

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
    <dc:identifier id="uid">urn:uuid:test</dc:identifier>
    <dc:title>The Last Lighthouse</dc:title>
    <dc:language>en</dc:language>
    <dc:creator>Jane Author</dc:creator>
  </metadata>
  <manifest></manifest>
  <spine></spine>
</package>
`;

function createMinimalEpubBytes(): Buffer {
  return ZipArchive.createStored([
    { name: EPUB_OCF.mimetypePath, data: Buffer.from(EPUB_OCF.mimetypeValue) },
    { name: EPUB_OCF.containerPath, data: Buffer.from(CONTAINER_XML) },
    { name: 'OEBPS/content.opf', data: Buffer.from(PACKAGE_XML) },
  ]);
}

function createSourceAsset(
  contentType = 'application/epub+zip',
  originalFileName = 'book.epub',
): BookAssetEntity {
  return new BookAssetEntity({
    id: 9,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 8,
    kind: BookAssetKind.SOURCE,
    storageKey: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    contentType,
    byteSize: 32,
    checksumSha256: 'a'.repeat(64),
    originalFileName,
    sortOrder: 0,
    isEncrypted: true,
  });
}

function createFixedLayoutEpubBytes(): Buffer {
  const packageXml = PACKAGE_XML.replace(
    '</metadata>',
    '<meta property="rendition:layout">pre-paginated</meta>\n  </metadata>',
  );
  return ZipArchive.createStored([
    { name: EPUB_OCF.mimetypePath, data: Buffer.from(EPUB_OCF.mimetypeValue) },
    { name: EPUB_OCF.containerPath, data: Buffer.from(CONTAINER_XML) },
    { name: 'OEBPS/content.opf', data: Buffer.from(packageXml) },
  ]);
}

function createSampleBook(layoutType: BookLayoutType | null = null): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A reflowable chapter book.',
    layoutType,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.PENDING,
    processingStatus: BookProcessingStatus.NOT_STARTED,
    publishedAt: null,
    ownerId: 4,
    categories: [],
  });
}

function createReflowableChapterEpubBytes(): Buffer {
  const packageXml = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:test</dc:identifier>
    <dc:title>The Last Lighthouse</dc:title>
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

function createSampleChapter(): BookChapterEntity {
  return new BookChapterEntity({
    id: 11,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 8,
    spineIndex: 0,
    href: 'OEBPS/chapter1.xhtml',
    manifestId: 'c1',
    title: 'The Harbor',
    contentText: 'The Harbor First chapter text.',
  });
}

function createFixedLayoutPagesEpubBytes(): Buffer {
  const packageXml = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:test</dc:identifier>
    <dc:title>Picture Book</dc:title>
    <dc:language>en</dc:language>
    <meta property="rendition:layout">pre-paginated</meta>
  </metadata>
  <manifest>
    <item id="p1" href="page1.xhtml" media-type="application/xhtml+xml"/>
    <item id="p2" href="page2.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="p1" properties="page-spread-left"/>
    <itemref idref="p2" properties="page-spread-right"/>
  </spine>
</package>
`;
  return ZipArchive.createStored([
    { name: EPUB_OCF.mimetypePath, data: Buffer.from(EPUB_OCF.mimetypeValue) },
    { name: EPUB_OCF.containerPath, data: Buffer.from(CONTAINER_XML) },
    { name: 'OEBPS/content.opf', data: Buffer.from(packageXml) },
    {
      name: 'OEBPS/page1.xhtml',
      data: Buffer.from(
        '<html><head><meta name="viewport" content="width=1200, height=1600"/></head><body><h1>Left Page</h1></body></html>',
      ),
    },
    {
      name: 'OEBPS/page2.xhtml',
      data: Buffer.from(
        '<html><head><meta name="viewport" content="width=1200, height=1600"/></head><body><h1>Right Page</h1></body></html>',
      ),
    },
  ]);
}

function createFixedLayoutTextEpubBytes(): Buffer {
  const packageXml = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:test</dc:identifier>
    <dc:title>Picture Book</dc:title>
    <dc:language>en</dc:language>
    <meta property="rendition:layout">pre-paginated</meta>
  </metadata>
  <manifest>
    <item id="p1" href="page1.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="p1"/>
  </spine>
</package>
`;
  return ZipArchive.createStored([
    { name: EPUB_OCF.mimetypePath, data: Buffer.from(EPUB_OCF.mimetypeValue) },
    { name: EPUB_OCF.containerPath, data: Buffer.from(CONTAINER_XML) },
    { name: 'OEBPS/content.opf', data: Buffer.from(packageXml) },
    {
      name: 'OEBPS/page1.xhtml',
      data: Buffer.from(
        '<html><head><meta name="viewport" content="width=1200, height=1600"/></head><body><svg><text x="120" y="80">Harbor</text></svg></body></html>',
      ),
    },
  ]);
}

function createSamplePage(): BookPageEntity {
  return new BookPageEntity({
    id: 21,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 8,
    spineIndex: 0,
    href: 'OEBPS/page1.xhtml',
    manifestId: 'p1',
    title: 'Left Page',
    width: 1200,
    height: 1600,
    spreadRole: BookPageSpreadRole.LEFT,
  });
}

function createSampleSpread(): BookSpreadEntity {
  return new BookSpreadEntity({
    id: 31,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 8,
    spreadIndex: 0,
    leftPageId: 21,
    rightPageId: 22,
    centerPageId: null,
  });
}

function createSampleTextLayer(): BookPageTextLayerEntity {
  return new BookPageTextLayerEntity({
    id: 51,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    pageId: 21,
    bookId: 8,
    contentText: 'Harbor lights',
  });
}

function createSourceMetadata(): BookSourceMetadataEntity {
  return new BookSourceMetadataEntity({
    id: 3,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 8,
    packagePath: 'OEBPS/content.opf',
    epubVersion: '3.0',
    identifier: 'urn:uuid:test',
    title: 'The Last Lighthouse',
    language: 'en',
    creator: 'Jane Author',
    publisher: null,
    description: null,
  });
}

describe('BookProcessingService', () => {
  let mockBookAssetService: { findLatestBookAsset: jest.Mock };
  let mockBookSourceMetadataRepository: {
    create: jest.Mock;
    update: jest.Mock;
    findByBookId: jest.Mock;
  };
  let mockBookChapterRepository: { replaceByBookId: jest.Mock; listByBookId: jest.Mock };
  let mockBookPageRepository: { replaceByBookId: jest.Mock; listByBookId: jest.Mock };
  let mockBookPageTextLayerRepository: { replaceByBookId: jest.Mock };
  let mockBookService: { updateBook: jest.Mock; getBookById: jest.Mock };
  let mockStorageManagerService: { getObject: jest.Mock };
  let mockEncryptionManagerService: { decrypt: jest.Mock };
  let bookProcessingService: BookProcessingService;

  beforeEach(() => {
    mockBookAssetService = { findLatestBookAsset: jest.fn() };
    mockBookSourceMetadataRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findByBookId: jest.fn(),
    };
    mockBookChapterRepository = { replaceByBookId: jest.fn(), listByBookId: jest.fn() };
    mockBookPageRepository = { replaceByBookId: jest.fn(), listByBookId: jest.fn() };
    mockBookPageTextLayerRepository = { replaceByBookId: jest.fn() };
    mockBookService = { updateBook: jest.fn(), getBookById: jest.fn() };
    mockStorageManagerService = { getObject: jest.fn() };
    mockEncryptionManagerService = { decrypt: jest.fn() };
    bookProcessingService = new BookProcessingService(
      mockBookAssetService as unknown as BookAssetService,
      mockBookSourceMetadataRepository,
      mockBookChapterRepository,
      mockBookPageRepository,
      mockBookPageTextLayerRepository,
      mockBookService as unknown as BookService,
      mockStorageManagerService as unknown as StorageManagerService,
      mockEncryptionManagerService as unknown as EncryptionManagerService,
    );
  });

  describe('validateEpubSource', () => {
    it('decrypts the latest source and accepts a valid OCF EPUB', async () => {
      const inputCiphertext = Buffer.from('encrypted-epub');
      const inputPlaintext = createMinimalEpubBytes();
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: inputCiphertext,
        contentType: 'application/epub+zip',
        byteSize: inputCiphertext.byteLength,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({ plaintext: inputPlaintext });
      await bookProcessingService.validateEpubSource(8);
      expect(mockBookAssetService.findLatestBookAsset).toHaveBeenCalledWith({
        bookId: 8,
        kind: BookAssetKind.SOURCE,
      });
      expect(mockEncryptionManagerService.decrypt).toHaveBeenCalledWith({
        ciphertext: inputCiphertext,
      });
    });

    it('rejects a book with no source file', async () => {
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(null);
      await expect(bookProcessingService.validateEpubSource(8)).rejects.toBeInstanceOf(
        BookProcessingMissingSourceException,
      );
      expect(mockStorageManagerService.getObject).not.toHaveBeenCalled();
    });

    it('rejects a PDF source without decrypting it', async () => {
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(
        createSourceAsset('application/pdf', 'book.pdf'),
      );
      await expect(bookProcessingService.validateEpubSource(8)).rejects.toBeInstanceOf(
        BookProcessingInvalidEpubException,
      );
      expect(mockStorageManagerService.getObject).not.toHaveBeenCalled();
    });

    it('rejects ciphertext that decrypts to an invalid EPUB', async () => {
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted'),
        contentType: 'application/epub+zip',
        byteSize: 9,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({ plaintext: Buffer.from('%PDF-1.4') });
      await expect(bookProcessingService.validateEpubSource(8)).rejects.toBeInstanceOf(
        BookProcessingInvalidEpubException,
      );
    });

    it('propagates a missing book from the asset service', async () => {
      mockBookAssetService.findLatestBookAsset.mockRejectedValue(
        new ResourceNotFoundException('Book', 99),
      );
      await expect(bookProcessingService.validateEpubSource(99)).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
    });
  });

  describe('ingestPdfSource', () => {
    it('decrypts the latest source and accepts a PDF header', async () => {
      const inputCiphertext = Buffer.from('encrypted-pdf');
      const inputPlaintext = Buffer.from('%PDF-1.4 source');
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(
        createSourceAsset('application/pdf', 'book.pdf'),
      );
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: inputCiphertext,
        contentType: 'application/pdf',
        byteSize: inputCiphertext.byteLength,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({ plaintext: inputPlaintext });
      await bookProcessingService.ingestPdfSource(8);
      expect(mockBookAssetService.findLatestBookAsset).toHaveBeenCalledWith({
        bookId: 8,
        kind: BookAssetKind.SOURCE,
      });
      expect(mockEncryptionManagerService.decrypt).toHaveBeenCalledWith({
        ciphertext: inputCiphertext,
      });
      expect(mockBookService.updateBook).not.toHaveBeenCalled();
      expect(mockBookPageRepository.replaceByBookId).not.toHaveBeenCalled();
      expect(mockBookChapterRepository.replaceByBookId).not.toHaveBeenCalled();
    });

    it('rejects a book with no source file', async () => {
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(null);
      await expect(bookProcessingService.ingestPdfSource(8)).rejects.toBeInstanceOf(
        BookProcessingMissingSourceException,
      );
      expect(mockStorageManagerService.getObject).not.toHaveBeenCalled();
    });

    it('rejects an EPUB source without decrypting it', async () => {
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      await expect(bookProcessingService.ingestPdfSource(8)).rejects.toBeInstanceOf(
        BookProcessingInvalidPdfException,
      );
      expect(mockStorageManagerService.getObject).not.toHaveBeenCalled();
    });

    it('rejects ciphertext that decrypts to a non-PDF payload', async () => {
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(
        createSourceAsset('application/pdf', 'book.pdf'),
      );
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted'),
        contentType: 'application/pdf',
        byteSize: 9,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({
        plaintext: createMinimalEpubBytes(),
      });
      await expect(bookProcessingService.ingestPdfSource(8)).rejects.toBeInstanceOf(
        BookProcessingInvalidPdfException,
      );
    });
  });

  describe('extractEpubMetadata', () => {
    it('creates preserved OPF metadata for a new source', async () => {
      const expectedMetadata = createSourceMetadata();
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted-epub'),
        contentType: 'application/epub+zip',
        byteSize: 14,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({
        plaintext: createMinimalEpubBytes(),
      });
      mockBookSourceMetadataRepository.findByBookId.mockResolvedValue(null);
      mockBookSourceMetadataRepository.create.mockResolvedValue(expectedMetadata);
      const actualMetadata = await bookProcessingService.extractEpubMetadata(8);
      expect(mockBookSourceMetadataRepository.create).toHaveBeenCalledWith({
        bookId: 8,
        packagePath: 'OEBPS/content.opf',
        epubVersion: '3.0',
        identifier: 'urn:uuid:test',
        title: 'The Last Lighthouse',
        language: 'en',
        creator: 'Jane Author',
        publisher: null,
        description: null,
      });
      expect(mockBookSourceMetadataRepository.update).not.toHaveBeenCalled();
      expect(actualMetadata).toBe(expectedMetadata);
    });

    it('replaces previously extracted metadata for the same book', async () => {
      const expectedMetadata = createSourceMetadata();
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted-epub'),
        contentType: 'application/epub+zip',
        byteSize: 14,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({
        plaintext: createMinimalEpubBytes(),
      });
      mockBookSourceMetadataRepository.findByBookId.mockResolvedValue(createSourceMetadata());
      mockBookSourceMetadataRepository.update.mockResolvedValue(expectedMetadata);
      await bookProcessingService.extractEpubMetadata(8);
      expect(mockBookSourceMetadataRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 3,
          title: 'The Last Lighthouse',
          identifier: 'urn:uuid:test',
        }),
      );
      expect(mockBookSourceMetadataRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('detectEpubLayout', () => {
    it('persists reflowable when the OPF omits rendition layout', async () => {
      const expectedBook = createSampleBook(BookLayoutType.REFLOWABLE);
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted-epub'),
        contentType: 'application/epub+zip',
        byteSize: 14,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({
        plaintext: createMinimalEpubBytes(),
      });
      mockBookService.updateBook.mockResolvedValue(expectedBook);
      const actualBook = await bookProcessingService.detectEpubLayout(8);
      expect(mockBookService.updateBook).toHaveBeenCalledWith({
        id: 8,
        layoutType: BookLayoutType.REFLOWABLE,
      });
      expect(actualBook).toBe(expectedBook);
    });

    it('persists fixed-layout for a pre-paginated rendition', async () => {
      const expectedBook = createSampleBook(BookLayoutType.FIXED_LAYOUT);
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted-epub'),
        contentType: 'application/epub+zip',
        byteSize: 14,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({
        plaintext: createFixedLayoutEpubBytes(),
      });
      mockBookService.updateBook.mockResolvedValue(expectedBook);
      const actualBook = await bookProcessingService.detectEpubLayout(8);
      expect(mockBookService.updateBook).toHaveBeenCalledWith({
        id: 8,
        layoutType: BookLayoutType.FIXED_LAYOUT,
      });
      expect(actualBook.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
    });
  });

  describe('extractEpubChapters', () => {
    it('replaces persisted spine chapters for a reflowable EPUB', async () => {
      const expectedChapters = [createSampleChapter()];
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted-epub'),
        contentType: 'application/epub+zip',
        byteSize: 14,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({
        plaintext: createReflowableChapterEpubBytes(),
      });
      mockBookChapterRepository.replaceByBookId.mockResolvedValue(expectedChapters);
      const actualChapters = await bookProcessingService.extractEpubChapters(8);
      expect(mockBookChapterRepository.replaceByBookId).toHaveBeenCalledWith({
        bookId: 8,
        chapters: [
          {
            spineIndex: 0,
            href: 'OEBPS/chapter1.xhtml',
            manifestId: 'c1',
            title: 'The Harbor',
            contentText: 'The Harbor First chapter text.',
          },
        ],
      });
      expect(actualChapters).toBe(expectedChapters);
    });

    it('rejects a pre-paginated EPUB before replacing chapters', async () => {
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted-epub'),
        contentType: 'application/epub+zip',
        byteSize: 14,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({
        plaintext: createFixedLayoutEpubBytes(),
      });
      await expect(bookProcessingService.extractEpubChapters(8)).rejects.toBeInstanceOf(
        BookProcessingNotReflowableException,
      );
      expect(mockBookChapterRepository.replaceByBookId).not.toHaveBeenCalled();
    });
  });

  describe('listBookChapters', () => {
    it('lists persisted chapters after confirming the book exists', async () => {
      const expectedChapters = [createSampleChapter()];
      mockBookService.getBookById.mockResolvedValue(createSampleBook(BookLayoutType.REFLOWABLE));
      mockBookChapterRepository.listByBookId.mockResolvedValue(expectedChapters);
      const actualChapters = await bookProcessingService.listBookChapters(8);
      expect(mockBookService.getBookById).toHaveBeenCalledWith(8);
      expect(mockBookChapterRepository.listByBookId).toHaveBeenCalledWith(8);
      expect(actualChapters).toBe(expectedChapters);
    });

    it('does not list chapters when the book is missing', async () => {
      mockBookService.getBookById.mockRejectedValue(new ResourceNotFoundException('Book', 8));
      await expect(bookProcessingService.listBookChapters(8)).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
      expect(mockBookChapterRepository.listByBookId).not.toHaveBeenCalled();
    });
  });

  describe('extractEpubFixedLayout', () => {
    it('replaces persisted pages and spreads for a pre-paginated EPUB', async () => {
      const expectedStructure = { pages: [createSamplePage()], spreads: [createSampleSpread()] };
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted-epub'),
        contentType: 'application/epub+zip',
        byteSize: 14,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({
        plaintext: createFixedLayoutPagesEpubBytes(),
      });
      mockBookPageRepository.replaceByBookId.mockResolvedValue(expectedStructure);
      const actualStructure = await bookProcessingService.extractEpubFixedLayout(8);
      expect(mockBookPageRepository.replaceByBookId).toHaveBeenCalledWith({
        bookId: 8,
        pages: [
          {
            spineIndex: 0,
            href: 'OEBPS/page1.xhtml',
            manifestId: 'p1',
            title: 'Left Page',
            width: 1200,
            height: 1600,
            spreadRole: BookPageSpreadRole.LEFT,
          },
          {
            spineIndex: 1,
            href: 'OEBPS/page2.xhtml',
            manifestId: 'p2',
            title: 'Right Page',
            width: 1200,
            height: 1600,
            spreadRole: BookPageSpreadRole.RIGHT,
          },
        ],
        spreads: [
          {
            spreadIndex: 0,
            leftSpineIndex: 0,
            rightSpineIndex: 1,
            centerSpineIndex: null,
          },
        ],
      });
      expect(actualStructure).toBe(expectedStructure);
    });

    it('rejects a reflowable EPUB before replacing pages', async () => {
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted-epub'),
        contentType: 'application/epub+zip',
        byteSize: 14,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({
        plaintext: createReflowableChapterEpubBytes(),
      });
      await expect(bookProcessingService.extractEpubFixedLayout(8)).rejects.toBeInstanceOf(
        BookProcessingNotFixedLayoutException,
      );
      expect(mockBookPageRepository.replaceByBookId).not.toHaveBeenCalled();
    });
  });

  describe('extractEpubFixedLayoutText', () => {
    it('replaces searchable text layers matched to persisted pages', async () => {
      const expectedLayers = [createSampleTextLayer()];
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted-epub'),
        contentType: 'application/epub+zip',
        byteSize: 14,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({
        plaintext: createFixedLayoutTextEpubBytes(),
      });
      mockBookPageRepository.listByBookId.mockResolvedValue([createSamplePage()]);
      mockBookPageTextLayerRepository.replaceByBookId.mockResolvedValue(expectedLayers);
      const actualLayers = await bookProcessingService.extractEpubFixedLayoutText(8);
      expect(mockBookPageTextLayerRepository.replaceByBookId).toHaveBeenCalledWith({
        bookId: 8,
        layers: [
          {
            pageId: 21,
            contentText: 'Harbor',
            runs: [
              {
                sortOrder: 0,
                text: 'Harbor',
                x: 120,
                y: 80,
                width: null,
                height: null,
              },
            ],
          },
        ],
      });
      expect(actualLayers).toBe(expectedLayers);
    });

    it('rejects text extraction when no pages have been persisted', async () => {
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted-epub'),
        contentType: 'application/epub+zip',
        byteSize: 14,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({
        plaintext: createFixedLayoutTextEpubBytes(),
      });
      mockBookPageRepository.listByBookId.mockResolvedValue([]);
      await expect(bookProcessingService.extractEpubFixedLayoutText(8)).rejects.toBeInstanceOf(
        BookProcessingMissingPagesException,
      );
      expect(mockBookPageTextLayerRepository.replaceByBookId).not.toHaveBeenCalled();
    });

    it('rejects a reflowable EPUB before replacing text layers', async () => {
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted-epub'),
        contentType: 'application/epub+zip',
        byteSize: 14,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({
        plaintext: createReflowableChapterEpubBytes(),
      });
      await expect(bookProcessingService.extractEpubFixedLayoutText(8)).rejects.toBeInstanceOf(
        BookProcessingNotFixedLayoutException,
      );
      expect(mockBookPageRepository.listByBookId).not.toHaveBeenCalled();
      expect(mockBookPageTextLayerRepository.replaceByBookId).not.toHaveBeenCalled();
    });

    it('rejects extracted layers that do not match persisted pages', async () => {
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted-epub'),
        contentType: 'application/epub+zip',
        byteSize: 14,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({
        plaintext: createFixedLayoutTextEpubBytes(),
      });
      mockBookPageRepository.listByBookId.mockResolvedValue([
        new BookPageEntity({
          ...createSamplePage(),
          href: 'OEBPS/other.xhtml',
          spineIndex: 9,
        }),
      ]);
      await expect(bookProcessingService.extractEpubFixedLayoutText(8)).rejects.toBeInstanceOf(
        BookProcessingInvalidEpubException,
      );
      expect(mockBookPageTextLayerRepository.replaceByBookId).not.toHaveBeenCalled();
    });
  });

  describe('processSource', () => {
    it('ingests a PDF source without extracting EPUB structure', async () => {
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(
        createSourceAsset('application/pdf', 'book.pdf'),
      );
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted-pdf'),
        contentType: 'application/pdf',
        byteSize: 13,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({
        plaintext: Buffer.from('%PDF-1.4 source'),
      });
      await bookProcessingService.processSource(8);
      expect(mockBookChapterRepository.replaceByBookId).not.toHaveBeenCalled();
      expect(mockBookPageRepository.replaceByBookId).not.toHaveBeenCalled();
      expect(mockBookService.updateBook).not.toHaveBeenCalled();
    });

    it('extracts reflowable chapters for an EPUB source', async () => {
      const expectedChapters = [createSampleChapter()];
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted-epub'),
        contentType: 'application/epub+zip',
        byteSize: 14,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({
        plaintext: createReflowableChapterEpubBytes(),
      });
      mockBookSourceMetadataRepository.findByBookId.mockResolvedValue(null);
      mockBookSourceMetadataRepository.create.mockResolvedValue(createSourceMetadata());
      mockBookService.updateBook.mockResolvedValue(createSampleBook(BookLayoutType.REFLOWABLE));
      mockBookChapterRepository.replaceByBookId.mockResolvedValue(expectedChapters);
      await bookProcessingService.processSource(8);
      expect(mockBookChapterRepository.replaceByBookId).toHaveBeenCalled();
      expect(mockBookPageRepository.replaceByBookId).not.toHaveBeenCalled();
    });

    it('extracts fixed-layout pages and text for a pre-paginated EPUB', async () => {
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
      mockStorageManagerService.getObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        body: Buffer.from('encrypted-epub'),
        contentType: 'application/epub+zip',
        byteSize: 14,
      });
      mockEncryptionManagerService.decrypt.mockReturnValue({
        plaintext: createFixedLayoutTextEpubBytes(),
      });
      mockBookSourceMetadataRepository.findByBookId.mockResolvedValue(null);
      mockBookSourceMetadataRepository.create.mockResolvedValue(createSourceMetadata());
      mockBookService.updateBook.mockResolvedValue(createSampleBook(BookLayoutType.FIXED_LAYOUT));
      mockBookPageRepository.replaceByBookId.mockResolvedValue({
        pages: [createSamplePage()],
        spreads: [createSampleSpread()],
      });
      mockBookPageRepository.listByBookId.mockResolvedValue([createSamplePage()]);
      mockBookPageTextLayerRepository.replaceByBookId.mockResolvedValue([createSampleTextLayer()]);
      await bookProcessingService.processSource(8);
      expect(mockBookPageRepository.replaceByBookId).toHaveBeenCalled();
      expect(mockBookPageTextLayerRepository.replaceByBookId).toHaveBeenCalled();
      expect(mockBookChapterRepository.replaceByBookId).not.toHaveBeenCalled();
    });

    it('rejects a source that is neither EPUB nor PDF', async () => {
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(
        createSourceAsset('application/octet-stream', 'book.bin'),
      );
      await expect(bookProcessingService.processSource(8)).rejects.toBeInstanceOf(
        BookProcessingInvalidSourceException,
      );
      expect(mockStorageManagerService.getObject).not.toHaveBeenCalled();
    });
  });
});
