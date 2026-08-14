import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookPublishingStatus,
  BookProcessingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';

import { BookAssetService } from './book-asset.service';

const SAMPLE_CHECKSUM = 'a'.repeat(64);

function createSampleBook(): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A reflowable chapter book.',
    layoutType: null,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.PENDING,
    processingStatus: BookProcessingStatus.NOT_STARTED,
    publishedAt: null,
    ownerId: 4,
  });
}

function createSampleAsset(): BookAssetEntity {
  return new BookAssetEntity({
    id: 9,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 8,
    kind: BookAssetKind.SOURCE,
    storageKey: 'books/8/source/original.epub',
    contentType: 'application/epub+zip',
    byteSize: 1048576,
    checksumSha256: SAMPLE_CHECKSUM,
    originalFileName: 'the-last-lighthouse.epub',
    sortOrder: 0,
    isEncrypted: true,
  });
}

describe('BookAssetService', () => {
  let mockBookAssetRepository: {
    create: jest.Mock;
    update: jest.Mock;
    findById: jest.Mock;
    findLatestByBookIdAndKind: jest.Mock;
    list: jest.Mock;
  };
  let mockBookService: { getBookById: jest.Mock };
  let bookAssetService: BookAssetService;

  beforeEach(() => {
    mockBookAssetRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findLatestByBookIdAndKind: jest.fn(),
      list: jest.fn(),
    };
    mockBookService = { getBookById: jest.fn() };
    bookAssetService = new BookAssetService(
      mockBookAssetRepository,
      mockBookService as unknown as BookService,
    );
  });

  describe('createBookAsset', () => {
    it('records a source file as encrypted after verifying the book', async () => {
      const expectedAsset = createSampleAsset();
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockBookAssetRepository.create.mockResolvedValue(expectedAsset);
      const actualAsset = await bookAssetService.createBookAsset({
        bookId: 8,
        kind: BookAssetKind.SOURCE,
        storageKey: '  books/8/source/original.epub  ',
        contentType: '  application/epub+zip  ',
        byteSize: 1048576,
        checksumSha256: SAMPLE_CHECKSUM.toUpperCase(),
        originalFileName: '  the-last-lighthouse.epub  ',
      });
      expect(mockBookService.getBookById).toHaveBeenCalledWith(8);
      expect(mockBookAssetRepository.create).toHaveBeenCalledWith({
        bookId: 8,
        kind: BookAssetKind.SOURCE,
        storageKey: 'books/8/source/original.epub',
        contentType: 'application/epub+zip',
        byteSize: 1048576,
        checksumSha256: SAMPLE_CHECKSUM,
        originalFileName: 'the-last-lighthouse.epub',
        sortOrder: 0,
        isEncrypted: true,
      });
      expect(actualAsset).toBe(expectedAsset);
    });

    it('records a processed file as encrypted by default', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockBookAssetRepository.create.mockResolvedValue(createSampleAsset());
      await bookAssetService.createBookAsset({
        bookId: 8,
        kind: BookAssetKind.PROCESSED,
        storageKey: 'books/8/processed/reader.epub',
        contentType: 'application/epub+zip',
        byteSize: 900000,
      });
      expect(mockBookAssetRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: BookAssetKind.PROCESSED,
          isEncrypted: true,
        }),
      );
    });

    it('records a preview image as unencrypted by default', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockBookAssetRepository.create.mockResolvedValue(createSampleAsset());
      await bookAssetService.createBookAsset({
        bookId: 8,
        kind: BookAssetKind.PREVIEW_IMAGE,
        storageKey: 'books/8/preview/cover.jpg',
        contentType: 'image/jpeg',
        byteSize: 12000,
      });
      expect(mockBookAssetRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: BookAssetKind.PREVIEW_IMAGE,
          isEncrypted: false,
          checksumSha256: null,
          originalFileName: null,
        }),
      );
    });

    it('records a future audio slot as encrypted by default', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockBookAssetRepository.create.mockResolvedValue(createSampleAsset());
      await bookAssetService.createBookAsset({
        bookId: 8,
        kind: BookAssetKind.AUDIO,
        storageKey: 'books/8/audio/chapter-1.mp3',
        contentType: 'audio/mpeg',
        byteSize: 2048,
      });
      expect(mockBookAssetRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: BookAssetKind.AUDIO,
          isEncrypted: true,
        }),
      );
    });

    it('propagates a missing book', async () => {
      mockBookService.getBookById.mockRejectedValue(new ResourceNotFoundException('Book', 99));
      await expect(
        bookAssetService.createBookAsset({
          bookId: 99,
          kind: BookAssetKind.SOURCE,
          storageKey: 'books/99/source/original.epub',
          contentType: 'application/epub+zip',
          byteSize: 1,
        }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(mockBookAssetRepository.create).not.toHaveBeenCalled();
    });

    it('rejects an empty storage key', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      await expect(
        bookAssetService.createBookAsset({
          bookId: 8,
          kind: BookAssetKind.SOURCE,
          storageKey: '   ',
          contentType: 'application/epub+zip',
          byteSize: 1,
        }),
      ).rejects.toBeInstanceOf(InvalidStateException);
      expect(mockBookAssetRepository.create).not.toHaveBeenCalled();
    });

    it('rejects an invalid checksum', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      await expect(
        bookAssetService.createBookAsset({
          bookId: 8,
          kind: BookAssetKind.SOURCE,
          storageKey: 'books/8/source/original.epub',
          contentType: 'application/epub+zip',
          byteSize: 1,
          checksumSha256: 'not-a-digest',
        }),
      ).rejects.toBeInstanceOf(InvalidStateException);
      expect(mockBookAssetRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateBookAsset', () => {
    it('updates storage metadata without changing kind or book', async () => {
      const current = createSampleAsset();
      mockBookAssetRepository.findById.mockResolvedValue(current);
      mockBookAssetRepository.update.mockResolvedValue(current);
      await bookAssetService.updateBookAsset({
        id: 9,
        storageKey: 'books/8/source/replaced.epub',
        byteSize: 2048,
      });
      expect(mockBookAssetRepository.update).toHaveBeenCalledWith({
        id: 9,
        storageKey: 'books/8/source/replaced.epub',
        contentType: undefined,
        byteSize: 2048,
        checksumSha256: undefined,
        originalFileName: undefined,
        sortOrder: undefined,
        isEncrypted: undefined,
      });
    });

    it('throws when the asset is missing', async () => {
      mockBookAssetRepository.findById.mockResolvedValue(null);
      await expect(
        bookAssetService.updateBookAsset({ id: 99, storageKey: 'gone' }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
    });
  });

  describe('listBookAssets', () => {
    it('applies default pagination after verifying the book', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockBookAssetRepository.list.mockResolvedValue({ entities: [createSampleAsset()], total: 1 });
      const actualPage = await bookAssetService.listBookAssets({ bookId: 8 });
      expect(mockBookService.getBookById).toHaveBeenCalledWith(8);
      expect(mockBookAssetRepository.list).toHaveBeenCalledWith({
        bookId: 8,
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
        kind: undefined,
      });
      expect(actualPage.total).toBe(1);
    });
  });

  describe('findLatestBookAsset', () => {
    it('returns the newest matching asset after verifying the book', async () => {
      const expectedAsset = createSampleAsset();
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockBookAssetRepository.findLatestByBookIdAndKind.mockResolvedValue(expectedAsset);
      const actualAsset = await bookAssetService.findLatestBookAsset({
        bookId: 8,
        kind: BookAssetKind.SOURCE,
      });
      expect(mockBookService.getBookById).toHaveBeenCalledWith(8);
      expect(mockBookAssetRepository.findLatestByBookIdAndKind).toHaveBeenCalledWith({
        bookId: 8,
        kind: BookAssetKind.SOURCE,
      });
      expect(actualAsset).toBe(expectedAsset);
    });
  });

  describe('getBookAssetById', () => {
    it('throws when the asset is missing', async () => {
      mockBookAssetRepository.findById.mockResolvedValue(null);
      await expect(bookAssetService.getBookAssetById(99)).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
    });
  });
});
