import { createHash } from 'node:crypto';

import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookPublishingStatus, BookType } from '@/modules/book/enum/general.enum';
import { BookAssetService } from '@/modules/book-asset/book-asset.service';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { BookAssetInvalidSourceTypeException } from '@/modules/book-asset/exceptions/book-asset-invalid-source-type.exception';
import { SOURCE_FILE_UPLOAD } from '@/modules/book-asset/source-file-upload.constant';
import { UserRole } from '@/modules/user/enum/general.enum';
import { EncryptionManagerService } from '@/providers/encryption/encryption-manager.service';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

import { BookAssetSourceService } from './book-asset-source.service';

const SAMPLE_CHECKSUM = 'a'.repeat(64);

function createSampleBook(ownerId = 4): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A reflowable chapter book.',
    layoutType: null,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.PENDING,
    publishedAt: null,
    ownerId,
  });
}

function createSampleAsset(): BookAssetEntity {
  return new BookAssetEntity({
    id: 9,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 8,
    kind: BookAssetKind.SOURCE,
    storageKey: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    contentType: 'application/pdf',
    byteSize: 32,
    checksumSha256: SAMPLE_CHECKSUM,
    originalFileName: 'the-last-lighthouse.pdf',
    sortOrder: 0,
    isEncrypted: true,
  });
}

describe('BookAssetSourceService', () => {
  let mockBookService: { getBookById: jest.Mock };
  let mockBookAssetService: { createBookAsset: jest.Mock };
  let mockStorageManagerService: { putObject: jest.Mock };
  let mockEncryptionManagerService: { encrypt: jest.Mock };
  let bookAssetSourceService: BookAssetSourceService;

  beforeEach(() => {
    mockBookService = { getBookById: jest.fn() };
    mockBookAssetService = { createBookAsset: jest.fn() };
    mockStorageManagerService = { putObject: jest.fn() };
    mockEncryptionManagerService = { encrypt: jest.fn() };
    bookAssetSourceService = new BookAssetSourceService(
      mockBookService as unknown as BookService,
      mockBookAssetService as unknown as BookAssetService,
      mockStorageManagerService as unknown as StorageManagerService,
      mockEncryptionManagerService as unknown as EncryptionManagerService,
    );
  });

  describe('uploadSourceFile', () => {
    it('encrypts the source, stores ciphertext, and records a source asset for the owner', async () => {
      const inputPlaintext = Buffer.from('%PDF-1.4 source');
      const inputCiphertext = Buffer.from('encrypted-source');
      const expectedAsset = createSampleAsset();
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockEncryptionManagerService.encrypt.mockReturnValue({ ciphertext: inputCiphertext });
      mockStorageManagerService.putObject.mockResolvedValue({
        key: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        byteSize: inputCiphertext.byteLength,
      });
      mockBookAssetService.createBookAsset.mockResolvedValue(expectedAsset);
      const actualAsset = await bookAssetSourceService.uploadSourceFile({
        bookId: 8,
        actorId: 4,
        actorRole: UserRole.AUTHOR,
        body: inputPlaintext,
        contentType: 'application/pdf',
        originalFileName: 'the-last-lighthouse.pdf',
      });
      expect(mockEncryptionManagerService.encrypt).toHaveBeenCalledWith({
        plaintext: inputPlaintext,
      });
      expect(mockStorageManagerService.putObject).toHaveBeenCalledWith({
        key: expect.stringMatching(/^books\/8\/source\/[0-9a-f-]{36}$/),
        body: inputCiphertext,
        contentType: 'application/pdf',
      });
      const actualStorageKey: string = mockStorageManagerService.putObject.mock.calls[0][0].key;
      expect(actualStorageKey).not.toContain('the-last-lighthouse.pdf');
      expect(mockBookAssetService.createBookAsset).toHaveBeenCalledWith({
        bookId: 8,
        kind: BookAssetKind.SOURCE,
        storageKey: 'books/8/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        contentType: 'application/pdf',
        byteSize: inputCiphertext.byteLength,
        checksumSha256: createHash('sha256').update(inputCiphertext).digest('hex'),
        originalFileName: 'the-last-lighthouse.pdf',
        isEncrypted: true,
      });
      expect(actualAsset).toBe(expectedAsset);
    });

    it('accepts an EPUB content type and normalizes it', async () => {
      const inputCiphertext = Buffer.from('encrypted-epub');
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockEncryptionManagerService.encrypt.mockReturnValue({ ciphertext: inputCiphertext });
      mockStorageManagerService.putObject.mockResolvedValue({
        key: 'books/8/source/uuid',
        byteSize: inputCiphertext.byteLength,
      });
      mockBookAssetService.createBookAsset.mockResolvedValue(createSampleAsset());
      await bookAssetSourceService.uploadSourceFile({
        bookId: 8,
        actorId: 4,
        actorRole: UserRole.AUTHOR,
        body: Buffer.from('epub-bytes'),
        contentType: 'application/epub',
        originalFileName: 'book.epub',
      });
      expect(mockBookAssetService.createBookAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          contentType: 'application/epub+zip',
        }),
      );
    });

    it('infers PDF type from the filename when the client sends octet-stream', async () => {
      const inputCiphertext = Buffer.from('encrypted-pdf');
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockEncryptionManagerService.encrypt.mockReturnValue({ ciphertext: inputCiphertext });
      mockStorageManagerService.putObject.mockResolvedValue({
        key: 'books/8/source/uuid',
        byteSize: inputCiphertext.byteLength,
      });
      mockBookAssetService.createBookAsset.mockResolvedValue(createSampleAsset());
      await bookAssetSourceService.uploadSourceFile({
        bookId: 8,
        actorId: 4,
        actorRole: UserRole.AUTHOR,
        body: Buffer.from('pdf-bytes'),
        contentType: 'application/octet-stream',
        originalFileName: 'chapter.pdf',
      });
      expect(mockBookAssetService.createBookAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          contentType: 'application/pdf',
        }),
      );
    });

    it('allows an admin to upload a source file for another owner', async () => {
      const inputCiphertext = Buffer.from('encrypted-source');
      mockBookService.getBookById.mockResolvedValue(createSampleBook(4));
      mockEncryptionManagerService.encrypt.mockReturnValue({ ciphertext: inputCiphertext });
      mockStorageManagerService.putObject.mockResolvedValue({
        key: 'books/8/source/uuid',
        byteSize: inputCiphertext.byteLength,
      });
      mockBookAssetService.createBookAsset.mockResolvedValue(createSampleAsset());
      await bookAssetSourceService.uploadSourceFile({
        bookId: 8,
        actorId: 99,
        actorRole: UserRole.ADMIN,
        body: Buffer.from('pdf-bytes'),
        contentType: 'application/pdf',
        originalFileName: 'book.pdf',
      });
      expect(mockBookAssetService.createBookAsset).toHaveBeenCalled();
    });

    it('hides a book from a non-owner author', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook(4));
      await expect(
        bookAssetSourceService.uploadSourceFile({
          bookId: 8,
          actorId: 5,
          actorRole: UserRole.AUTHOR,
          body: Buffer.from('pdf-bytes'),
          contentType: 'application/pdf',
          originalFileName: 'book.pdf',
        }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(mockEncryptionManagerService.encrypt).not.toHaveBeenCalled();
    });

    it('rejects an empty source file', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      await expect(
        bookAssetSourceService.uploadSourceFile({
          bookId: 8,
          actorId: 4,
          actorRole: UserRole.AUTHOR,
          body: Buffer.alloc(0),
          contentType: 'application/pdf',
          originalFileName: 'book.pdf',
        }),
      ).rejects.toMatchObject({
        code: 'BOOK_ASSET_EMPTY_SOURCE',
      } satisfies Partial<InvalidStateException>);
    });

    it('rejects a source file over the configured size', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      const inputBody = Buffer.allocUnsafe(SOURCE_FILE_UPLOAD.maxBytes + 1);
      await expect(
        bookAssetSourceService.uploadSourceFile({
          bookId: 8,
          actorId: 4,
          actorRole: UserRole.AUTHOR,
          body: inputBody,
          contentType: 'application/pdf',
          originalFileName: 'book.pdf',
        }),
      ).rejects.toMatchObject({
        code: 'BOOK_ASSET_SOURCE_TOO_LARGE',
      } satisfies Partial<InvalidStateException>);
    });

    it('rejects an unsupported source type', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      await expect(
        bookAssetSourceService.uploadSourceFile({
          bookId: 8,
          actorId: 4,
          actorRole: UserRole.AUTHOR,
          body: Buffer.from('not-a-book'),
          contentType: 'text/plain',
          originalFileName: 'notes.txt',
        }),
      ).rejects.toBeInstanceOf(BookAssetInvalidSourceTypeException);
    });
  });
});
