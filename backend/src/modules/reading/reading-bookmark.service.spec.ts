import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { ReadingBookmarkEntity } from '@/modules/reading/entity/reading-bookmark.entity';
import { ReadingBookmarkBookLayoutUnknownException } from '@/modules/reading/exceptions/reading-bookmark-book-layout-unknown.exception';
import { ReadingBookmarkInvalidPositionException } from '@/modules/reading/exceptions/reading-bookmark-invalid-position.exception';
import { EntitlementService } from '@/modules/entitlement/entitlement.service';
import { UserService } from '@/modules/user/user.service';

import { ReadingBookmarkService } from './reading-bookmark.service';

function createSampleBook(layoutType: BookLayoutType | null): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A reflowable chapter book.',
    layoutType,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.APPROVED,
    processingStatus: BookProcessingStatus.READY,
    publishedAt: new Date('2026-03-01T00:00:00.000Z'),
    ownerId: 4,
  });
}

function createSampleBookmark(): ReadingBookmarkEntity {
  return new ReadingBookmarkEntity({
    id: 5,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 7,
    bookId: 8,
    layoutType: BookLayoutType.REFLOWABLE,
    spineIndex: 1,
    scrollOffset: 120,
    spreadIndex: null,
    pageNumber: null,
  });
}

describe('ReadingBookmarkService', () => {
  let mockReadingBookmarkRepository: {
    create: jest.Mock;
    list: jest.Mock;
    findById: jest.Mock;
    delete: jest.Mock;
  };
  let mockBookService: { getBookById: jest.Mock };
  let mockUserService: { getUserById: jest.Mock };
  let mockEntitlementService: { assertCanAccessFullBook: jest.Mock };
  let readingBookmarkService: ReadingBookmarkService;

  beforeEach(() => {
    mockReadingBookmarkRepository = {
      create: jest.fn(),
      list: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };
    mockBookService = { getBookById: jest.fn() };
    mockUserService = { getUserById: jest.fn() };
    mockEntitlementService = { assertCanAccessFullBook: jest.fn().mockResolvedValue(undefined) };
    readingBookmarkService = new ReadingBookmarkService(
      mockReadingBookmarkRepository,
      mockBookService as unknown as BookService,
      mockUserService as unknown as UserService,
      mockEntitlementService as unknown as EntitlementService,
    );
  });

  describe('createReadingBookmark', () => {
    it('creates a reflowable bookmark from spine index and scroll offset', async () => {
      const expectedBookmark = createSampleBookmark();
      mockUserService.getUserById.mockResolvedValue({ id: 7 });
      mockBookService.getBookById.mockResolvedValue(createSampleBook(BookLayoutType.REFLOWABLE));
      mockReadingBookmarkRepository.create.mockResolvedValue(expectedBookmark);
      const actualBookmark = await readingBookmarkService.createReadingBookmark({
        userId: 7,
        bookId: 8,
        spineIndex: 1,
        scrollOffset: 120,
      });
      expect(mockReadingBookmarkRepository.create).toHaveBeenCalledWith({
        userId: 7,
        bookId: 8,
        layoutType: BookLayoutType.REFLOWABLE,
        spineIndex: 1,
        scrollOffset: 120,
        spreadIndex: null,
        pageNumber: null,
      });
      expect(actualBookmark).toBe(expectedBookmark);
    });

    it('rejects reflowable fields on a fixed-layout book', async () => {
      mockUserService.getUserById.mockResolvedValue({ id: 7 });
      mockBookService.getBookById.mockResolvedValue(createSampleBook(BookLayoutType.FIXED_LAYOUT));
      await expect(
        readingBookmarkService.createReadingBookmark({
          userId: 7,
          bookId: 8,
          spineIndex: 1,
          scrollOffset: 120,
        }),
      ).rejects.toBeInstanceOf(ReadingBookmarkInvalidPositionException);
      expect(mockReadingBookmarkRepository.create).not.toHaveBeenCalled();
    });

    it('rejects a bookmark when the book has no layout type', async () => {
      mockUserService.getUserById.mockResolvedValue({ id: 7 });
      mockBookService.getBookById.mockResolvedValue(createSampleBook(null));
      await expect(
        readingBookmarkService.createReadingBookmark({
          userId: 7,
          bookId: 8,
          spineIndex: 0,
          scrollOffset: 0,
        }),
      ).rejects.toBeInstanceOf(ReadingBookmarkBookLayoutUnknownException);
    });
  });

  describe('listReadingBookmarks', () => {
    it('lists the caller bookmarks for a book with pagination defaults', async () => {
      const expectedPage = { entities: [createSampleBookmark()], total: 1 };
      mockBookService.getBookById.mockResolvedValue(createSampleBook(BookLayoutType.REFLOWABLE));
      mockReadingBookmarkRepository.list.mockResolvedValue(expectedPage);
      const actualPage = await readingBookmarkService.listReadingBookmarks({
        userId: 7,
        bookId: 8,
      });
      expect(mockReadingBookmarkRepository.list).toHaveBeenCalledWith({
        userId: 7,
        bookId: 8,
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
      });
      expect(actualPage).toBe(expectedPage);
    });
  });

  describe('listReadingBookmarksForSync', () => {
    it('lists bookmarks without applying HTTP pagination defaults', async () => {
      const expectedPage = { entities: [createSampleBookmark()], total: 1 };
      mockReadingBookmarkRepository.list.mockResolvedValue(expectedPage);
      const actualPage = await readingBookmarkService.listReadingBookmarksForSync({
        userId: 7,
      });
      expect(mockReadingBookmarkRepository.list).toHaveBeenCalledWith({
        userId: 7,
        bookId: undefined,
        updatedSince: undefined,
      });
      expect(actualPage).toBe(expectedPage);
      expect(mockEntitlementService.assertCanAccessFullBook).not.toHaveBeenCalled();
    });
  });

  describe('deleteReadingBookmark', () => {
    it('soft-deletes a bookmark owned by the caller for the book', async () => {
      const existing = createSampleBookmark();
      mockReadingBookmarkRepository.findById.mockResolvedValue(existing);
      mockReadingBookmarkRepository.delete.mockResolvedValue(existing);
      const actualBookmark = await readingBookmarkService.deleteReadingBookmark({
        id: 5,
        userId: 7,
        bookId: 8,
      });
      expect(mockReadingBookmarkRepository.delete).toHaveBeenCalledWith(5);
      expect(actualBookmark).toBe(existing);
    });

    it('hides another user bookmark as not found', async () => {
      mockReadingBookmarkRepository.findById.mockResolvedValue(createSampleBookmark());
      await expect(
        readingBookmarkService.deleteReadingBookmark({
          id: 5,
          userId: 9,
          bookId: 8,
        }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(mockReadingBookmarkRepository.delete).not.toHaveBeenCalled();
    });
  });
});
