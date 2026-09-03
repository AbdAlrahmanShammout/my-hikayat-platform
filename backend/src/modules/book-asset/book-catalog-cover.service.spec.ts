import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BOOK_CATALOG_COVER } from '@/modules/book-asset/book-catalog-cover.constant';
import { BookCatalogCoverService } from '@/modules/book-asset/book-catalog-cover.service';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { BookAssetRepository } from '@/modules/book-asset/repository/book-asset.repository';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

describe('BookCatalogCoverService', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');

  function createBook(id: number): BookEntity {
    return new BookEntity({
      id,
      createdAt,
      updatedAt,
      title: `Book ${id}`,
      description: 'Description',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      publishingStatus: BookPublishingStatus.APPROVED,
      processingStatus: BookProcessingStatus.READY,
      publishedAt: createdAt,
      ownerId: 4,
      categories: [],
    });
  }

  function createPreview(bookId: number): BookAssetEntity {
    return new BookAssetEntity({
      id: bookId * 10,
      createdAt,
      updatedAt,
      bookId,
      kind: BookAssetKind.PREVIEW_IMAGE,
      storageKey: `books/${bookId}/preview/cover.jpg`,
      contentType: 'image/jpeg',
      byteSize: 12_000,
      checksumSha256: null,
      originalFileName: 'cover.jpg',
      sortOrder: 0,
      isEncrypted: false,
      wrappedContentKey: null,
    });
  }

  let mockBookAssetRepository: { findLatestByBookIdsAndKind: jest.Mock };
  let mockStorageManagerService: { createSignedGetUrl: jest.Mock };
  let bookCatalogCoverService: BookCatalogCoverService;

  beforeEach(() => {
    mockBookAssetRepository = { findLatestByBookIdsAndKind: jest.fn() };
    mockStorageManagerService = { createSignedGetUrl: jest.fn() };
    bookCatalogCoverService = new BookCatalogCoverService(
      mockBookAssetRepository as unknown as BookAssetRepository,
      mockStorageManagerService as unknown as StorageManagerService,
    );
  });

  it('returns BookResponse rows with null cover when no preview exists', async () => {
    mockBookAssetRepository.findLatestByBookIdsAndKind.mockResolvedValue([]);
    const actualResponses = await bookCatalogCoverService.toBookResponses([createBook(8)]);
    expect(mockBookAssetRepository.findLatestByBookIdsAndKind).toHaveBeenCalledWith({
      bookIds: [8],
      kind: BookAssetKind.PREVIEW_IMAGE,
    });
    expect(actualResponses).toHaveLength(1);
    expect(actualResponses[0].cover).toBeNull();
    expect(mockStorageManagerService.createSignedGetUrl).not.toHaveBeenCalled();
  });

  it('attaches signed cover URLs without requiring entitlement', async () => {
    mockBookAssetRepository.findLatestByBookIdsAndKind.mockResolvedValue([createPreview(8)]);
    mockStorageManagerService.createSignedGetUrl.mockResolvedValue({
      url: 'https://cdn.example.com/cover.jpg?sig=1',
      expiresAt: new Date('2026-09-03T13:00:00.000Z'),
    });
    const actualResponses = await bookCatalogCoverService.toBookResponses([
      createBook(8),
      createBook(9),
    ]);
    expect(mockStorageManagerService.createSignedGetUrl).toHaveBeenCalledWith({
      key: 'books/8/preview/cover.jpg',
      expiresInSeconds: BOOK_CATALOG_COVER.expiresInSeconds,
    });
    expect(actualResponses[0].cover).toEqual({
      url: 'https://cdn.example.com/cover.jpg?sig=1',
      expiresAt: new Date('2026-09-03T13:00:00.000Z'),
      contentType: 'image/jpeg',
    });
    expect(actualResponses[1].cover).toBeNull();
  });

  it('returns an empty map for an empty book id list', async () => {
    const actualMap = await bookCatalogCoverService.resolveCoverByBookId([]);
    expect(actualMap.size).toBe(0);
    expect(mockBookAssetRepository.findLatestByBookIdsAndKind).not.toHaveBeenCalled();
  });
});
