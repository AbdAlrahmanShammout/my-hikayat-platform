import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookAssetService } from '@/modules/book-asset/book-asset.service';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { EPUB_OCF } from '@/modules/book-processing/epub-ocf.constant';
import { BookSourceMetadataEntity } from '@/modules/book-processing/entity/book-source-metadata.entity';
import { BookProcessingInvalidEpubException } from '@/modules/book-processing/exceptions/book-processing-invalid-epub.exception';
import { BookProcessingMissingSourceException } from '@/modules/book-processing/exceptions/book-processing-missing-source.exception';
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
    mockStorageManagerService = { getObject: jest.fn() };
    mockEncryptionManagerService = { decrypt: jest.fn() };
    bookProcessingService = new BookProcessingService(
      mockBookAssetService as unknown as BookAssetService,
      mockBookSourceMetadataRepository,
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
});
