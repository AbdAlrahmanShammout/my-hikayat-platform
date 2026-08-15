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
import { BOOK_DELIVERY_GRANT } from '@/modules/book-asset/book-delivery-grant.constant';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { BookAssetEncryptedSourceMissingException } from '@/modules/book-asset/exceptions/book-asset-encrypted-source-missing.exception';
import { BookAssetNotEncryptedException } from '@/modules/book-asset/exceptions/book-asset-not-encrypted.exception';
import { FullBookAccessDeniedException } from '@/modules/entitlement/exceptions/full-book-access-denied.exception';
import { EntitlementService } from '@/modules/entitlement/entitlement.service';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

import { BookAssetDeliveryService } from './book-asset-delivery.service';

function createCatalogBook(): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A reflowable chapter book.',
    layoutType: BookLayoutType.REFLOWABLE,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.APPROVED,
    processingStatus: BookProcessingStatus.READY,
    publishedAt: new Date('2026-08-15T00:00:00.000Z'),
    ownerId: 4,
  });
}

function createSampleSource(isEncrypted = true): BookAssetEntity {
  return new BookAssetEntity({
    id: 9,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 8,
    kind: BookAssetKind.SOURCE,
    storageKey: 'books/8/source/uuid',
    contentType: 'application/epub+zip',
    byteSize: 16,
    checksumSha256: 'a'.repeat(64),
    originalFileName: 'book.epub',
    sortOrder: 0,
    isEncrypted,
  });
}

describe('BookAssetDeliveryService', () => {
  const expiresAt = new Date('2026-08-15T16:05:00.000Z');
  let mockBookService: { getCatalogBookById: jest.Mock };
  let mockBookAssetService: { findLatestBookAsset: jest.Mock };
  let mockEntitlementService: { assertPaidReadingAccess: jest.Mock };
  let mockStorageManagerService: { createSignedGetUrl: jest.Mock };
  let bookAssetDeliveryService: BookAssetDeliveryService;

  beforeEach(() => {
    mockBookService = { getCatalogBookById: jest.fn() };
    mockBookAssetService = { findLatestBookAsset: jest.fn() };
    mockEntitlementService = { assertPaidReadingAccess: jest.fn().mockResolvedValue(undefined) };
    mockStorageManagerService = { createSignedGetUrl: jest.fn() };
    bookAssetDeliveryService = new BookAssetDeliveryService(
      mockBookService as unknown as BookService,
      mockBookAssetService as unknown as BookAssetService,
      mockEntitlementService as unknown as EntitlementService,
      mockStorageManagerService as unknown as StorageManagerService,
    );
  });

  describe('createSourceDeliveryGrant', () => {
    it('issues a signed URL to the encrypted source without exposing the storage key', async () => {
      mockBookService.getCatalogBookById.mockResolvedValue(createCatalogBook());
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSampleSource());
      mockStorageManagerService.createSignedGetUrl.mockResolvedValue({
        url: 'memory://books%2F8%2Fsource%2Fuuid',
        expiresAt,
      });
      const actualGrant = await bookAssetDeliveryService.createSourceDeliveryGrant({
        bookId: 8,
        userId: 5,
      });
      expect(mockBookService.getCatalogBookById).toHaveBeenCalledWith(8);
      expect(mockEntitlementService.assertPaidReadingAccess).toHaveBeenCalledWith(5);
      expect(mockStorageManagerService.createSignedGetUrl).toHaveBeenCalledWith({
        key: 'books/8/source/uuid',
        expiresInSeconds: BOOK_DELIVERY_GRANT.expiresInSeconds,
      });
      expect(actualGrant).toEqual({
        bookId: 8,
        bookAssetId: 9,
        kind: BookAssetKind.SOURCE,
        url: 'memory://books%2F8%2Fsource%2Fuuid',
        expiresAt,
        contentType: 'application/epub+zip',
        byteSize: 16,
        checksumSha256: 'a'.repeat(64),
        isEncrypted: true,
      });
      expect(actualGrant).not.toHaveProperty('storageKey');
    });

    it('hides unpublished books as not found', async () => {
      mockBookService.getCatalogBookById.mockRejectedValue(
        new ResourceNotFoundException('Book', 8),
      );
      await expect(
        bookAssetDeliveryService.createSourceDeliveryGrant({ bookId: 8, userId: 5 }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(mockEntitlementService.assertPaidReadingAccess).not.toHaveBeenCalled();
    });

    it('requires paid reading access after the catalog book is visible', async () => {
      mockBookService.getCatalogBookById.mockResolvedValue(createCatalogBook());
      mockEntitlementService.assertPaidReadingAccess.mockRejectedValue(
        new FullBookAccessDeniedException(),
      );
      await expect(
        bookAssetDeliveryService.createSourceDeliveryGrant({ bookId: 8, userId: 5 }),
      ).rejects.toBeInstanceOf(FullBookAccessDeniedException);
      expect(mockBookAssetService.findLatestBookAsset).not.toHaveBeenCalled();
    });

    it('rejects a catalog book that has no source file', async () => {
      mockBookService.getCatalogBookById.mockResolvedValue(createCatalogBook());
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(null);
      await expect(
        bookAssetDeliveryService.createSourceDeliveryGrant({ bookId: 8, userId: 5 }),
      ).rejects.toBeInstanceOf(BookAssetEncryptedSourceMissingException);
    });

    it('rejects a source file that is not encrypted', async () => {
      mockBookService.getCatalogBookById.mockResolvedValue(createCatalogBook());
      mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSampleSource(false));
      await expect(
        bookAssetDeliveryService.createSourceDeliveryGrant({ bookId: 8, userId: 5 }),
      ).rejects.toBeInstanceOf(BookAssetNotEncryptedException);
      expect(mockStorageManagerService.createSignedGetUrl).not.toHaveBeenCalled();
    });
  });
});
