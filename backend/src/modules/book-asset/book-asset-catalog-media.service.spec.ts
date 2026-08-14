import { createHash } from 'node:crypto';

import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookPublishingStatus, BookType } from '@/modules/book/enum/general.enum';
import { BookAssetService } from '@/modules/book-asset/book-asset.service';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { BookAssetInvalidPreviewTypeException } from '@/modules/book-asset/exceptions/book-asset-invalid-preview-type.exception';
import { BookAssetInvalidPromoVideoTypeException } from '@/modules/book-asset/exceptions/book-asset-invalid-promo-video-type.exception';
import { UserRole } from '@/modules/user/enum/general.enum';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

import { BookAssetCatalogMediaService } from './book-asset-catalog-media.service';

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

function createPreviewAsset(): BookAssetEntity {
  return new BookAssetEntity({
    id: 11,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 8,
    kind: BookAssetKind.PREVIEW_IMAGE,
    storageKey: 'books/8/preview/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    contentType: 'image/jpeg',
    byteSize: 12,
    checksumSha256: 'a'.repeat(64),
    originalFileName: 'cover.jpg',
    sortOrder: 0,
    isEncrypted: false,
  });
}

function createPromoAsset(): BookAssetEntity {
  return new BookAssetEntity({
    id: 12,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 8,
    kind: BookAssetKind.PROMO_VIDEO,
    storageKey: 'books/8/promo/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    contentType: 'video/mp4',
    byteSize: 16,
    checksumSha256: 'b'.repeat(64),
    originalFileName: 'trailer.mp4',
    sortOrder: 0,
    isEncrypted: false,
  });
}

describe('BookAssetCatalogMediaService', () => {
  let mockBookService: { getBookById: jest.Mock };
  let mockBookAssetService: {
    createBookAsset: jest.Mock;
    updateBookAsset: jest.Mock;
    listBookAssets: jest.Mock;
  };
  let mockStorageManagerService: { putObject: jest.Mock };
  let bookAssetCatalogMediaService: BookAssetCatalogMediaService;

  beforeEach(() => {
    mockBookService = { getBookById: jest.fn() };
    mockBookAssetService = {
      createBookAsset: jest.fn(),
      updateBookAsset: jest.fn(),
      listBookAssets: jest.fn(),
    };
    mockStorageManagerService = { putObject: jest.fn() };
    bookAssetCatalogMediaService = new BookAssetCatalogMediaService(
      mockBookService as unknown as BookService,
      mockBookAssetService as unknown as BookAssetService,
      mockStorageManagerService as unknown as StorageManagerService,
    );
  });

  describe('uploadPreviewImage', () => {
    it('stores an unencrypted JPEG preview for the owner', async () => {
      const inputBody = Buffer.from('jpeg-bytes');
      const expectedAsset = createPreviewAsset();
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockStorageManagerService.putObject.mockResolvedValue({
        key: 'books/8/preview/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        byteSize: inputBody.byteLength,
      });
      mockBookAssetService.createBookAsset.mockResolvedValue(expectedAsset);
      const actualAsset = await bookAssetCatalogMediaService.uploadPreviewImage({
        bookId: 8,
        actorId: 4,
        actorRole: UserRole.AUTHOR,
        body: inputBody,
        contentType: 'image/jpeg',
        originalFileName: 'cover.jpg',
      });
      expect(mockStorageManagerService.putObject).toHaveBeenCalledWith({
        key: expect.stringMatching(/^books\/8\/preview\/[0-9a-f-]{36}$/),
        body: inputBody,
        contentType: 'image/jpeg',
      });
      expect(mockBookAssetService.createBookAsset).toHaveBeenCalledWith({
        bookId: 8,
        kind: BookAssetKind.PREVIEW_IMAGE,
        storageKey: 'books/8/preview/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        contentType: 'image/jpeg',
        byteSize: inputBody.byteLength,
        checksumSha256: createHash('sha256').update(inputBody).digest('hex'),
        originalFileName: 'cover.jpg',
        isEncrypted: false,
      });
      expect(actualAsset).toBe(expectedAsset);
    });

    it('infers PNG type from the filename when the client sends octet-stream', async () => {
      const inputBody = Buffer.from('png-bytes');
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockStorageManagerService.putObject.mockResolvedValue({
        key: 'books/8/preview/uuid',
        byteSize: inputBody.byteLength,
      });
      mockBookAssetService.createBookAsset.mockResolvedValue(createPreviewAsset());
      await bookAssetCatalogMediaService.uploadPreviewImage({
        bookId: 8,
        actorId: 4,
        actorRole: UserRole.AUTHOR,
        body: inputBody,
        contentType: 'application/octet-stream',
        originalFileName: 'spread.png',
      });
      expect(mockBookAssetService.createBookAsset).toHaveBeenCalledWith(
        expect.objectContaining({ contentType: 'image/png' }),
      );
    });

    it('hides a book from a non-owner author', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook(4));
      await expect(
        bookAssetCatalogMediaService.uploadPreviewImage({
          bookId: 8,
          actorId: 5,
          actorRole: UserRole.AUTHOR,
          body: Buffer.from('jpeg-bytes'),
          contentType: 'image/jpeg',
          originalFileName: 'cover.jpg',
        }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(mockStorageManagerService.putObject).not.toHaveBeenCalled();
    });

    it('rejects an empty preview image', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      await expect(
        bookAssetCatalogMediaService.uploadPreviewImage({
          bookId: 8,
          actorId: 4,
          actorRole: UserRole.AUTHOR,
          body: Buffer.alloc(0),
          contentType: 'image/jpeg',
          originalFileName: 'cover.jpg',
        }),
      ).rejects.toMatchObject({
        code: 'BOOK_ASSET_EMPTY_PREVIEW',
      } satisfies Partial<InvalidStateException>);
    });

    it('rejects an unsupported preview type', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      await expect(
        bookAssetCatalogMediaService.uploadPreviewImage({
          bookId: 8,
          actorId: 4,
          actorRole: UserRole.AUTHOR,
          body: Buffer.from('gif-bytes'),
          contentType: 'image/gif',
          originalFileName: 'cover.gif',
        }),
      ).rejects.toBeInstanceOf(BookAssetInvalidPreviewTypeException);
    });
  });

  describe('uploadPromoVideo', () => {
    it('stores an unencrypted MP4 promo video when none exists', async () => {
      const inputBody = Buffer.from('mp4-bytes');
      const expectedAsset = createPromoAsset();
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockBookAssetService.listBookAssets.mockResolvedValue({ entities: [], total: 0 });
      mockStorageManagerService.putObject.mockResolvedValue({
        key: 'books/8/promo/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        byteSize: inputBody.byteLength,
      });
      mockBookAssetService.createBookAsset.mockResolvedValue(expectedAsset);
      const actualAsset = await bookAssetCatalogMediaService.uploadPromoVideo({
        bookId: 8,
        actorId: 4,
        actorRole: UserRole.AUTHOR,
        body: inputBody,
        contentType: 'video/mp4',
        originalFileName: 'trailer.mp4',
      });
      expect(mockBookAssetService.createBookAsset).toHaveBeenCalledWith({
        bookId: 8,
        kind: BookAssetKind.PROMO_VIDEO,
        storageKey: 'books/8/promo/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        contentType: 'video/mp4',
        byteSize: inputBody.byteLength,
        checksumSha256: createHash('sha256').update(inputBody).digest('hex'),
        originalFileName: 'trailer.mp4',
        isEncrypted: false,
      });
      expect(mockBookAssetService.updateBookAsset).not.toHaveBeenCalled();
      expect(actualAsset).toBe(expectedAsset);
    });

    it('replaces the existing promo video in place', async () => {
      const inputBody = Buffer.from('webm-bytes');
      const existingAsset = createPromoAsset();
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockBookAssetService.listBookAssets.mockResolvedValue({
        entities: [existingAsset],
        total: 1,
      });
      mockStorageManagerService.putObject.mockResolvedValue({
        key: 'books/8/promo/new-uuid',
        byteSize: inputBody.byteLength,
      });
      mockBookAssetService.updateBookAsset.mockResolvedValue(existingAsset);
      await bookAssetCatalogMediaService.uploadPromoVideo({
        bookId: 8,
        actorId: 99,
        actorRole: UserRole.ADMIN,
        body: inputBody,
        contentType: 'video/webm',
        originalFileName: 'trailer.webm',
      });
      expect(mockBookAssetService.updateBookAsset).toHaveBeenCalledWith({
        id: 12,
        storageKey: 'books/8/promo/new-uuid',
        contentType: 'video/webm',
        byteSize: inputBody.byteLength,
        checksumSha256: createHash('sha256').update(inputBody).digest('hex'),
        originalFileName: 'trailer.webm',
        isEncrypted: false,
      });
      expect(mockBookAssetService.createBookAsset).not.toHaveBeenCalled();
    });

    it('rejects an unsupported promo video type', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      await expect(
        bookAssetCatalogMediaService.uploadPromoVideo({
          bookId: 8,
          actorId: 4,
          actorRole: UserRole.AUTHOR,
          body: Buffer.from('avi-bytes'),
          contentType: 'video/x-msvideo',
          originalFileName: 'trailer.avi',
        }),
      ).rejects.toBeInstanceOf(BookAssetInvalidPromoVideoTypeException);
    });
  });
});
