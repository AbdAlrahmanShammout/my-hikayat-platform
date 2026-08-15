import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';
import { ReadingProgressBookLayoutUnknownException } from '@/modules/reading/exceptions/reading-progress-book-layout-unknown.exception';
import { ReadingProgressInvalidPositionException } from '@/modules/reading/exceptions/reading-progress-invalid-position.exception';
import { UserService } from '@/modules/user/user.service';

import { ReadingProgressService } from './reading-progress.service';

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

function createSampleProgress(): ReadingProgressEntity {
  return new ReadingProgressEntity({
    id: 3,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 7,
    bookId: 8,
    layoutType: BookLayoutType.REFLOWABLE,
    spineIndex: 1,
    scrollOffset: 120,
    spreadIndex: null,
    pageNumber: null,
    lastSessionAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}

describe('ReadingProgressService', () => {
  let mockReadingProgressRepository: {
    create: jest.Mock;
    update: jest.Mock;
    list: jest.Mock;
    findById: jest.Mock;
    findByUserIdAndBookId: jest.Mock;
  };
  let mockBookService: { getBookById: jest.Mock };
  let mockUserService: { getUserById: jest.Mock };
  let readingProgressService: ReadingProgressService;

  beforeEach(() => {
    mockReadingProgressRepository = {
      create: jest.fn(),
      update: jest.fn(),
      list: jest.fn(),
      findById: jest.fn(),
      findByUserIdAndBookId: jest.fn(),
    };
    mockBookService = { getBookById: jest.fn() };
    mockUserService = { getUserById: jest.fn() };
    readingProgressService = new ReadingProgressService(
      mockReadingProgressRepository,
      mockBookService as unknown as BookService,
      mockUserService as unknown as UserService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('saveReadingProgress', () => {
    it('creates reflowable progress from spine index and scroll offset', async () => {
      const expectedProgress = createSampleProgress();
      const lastSessionAt = new Date('2026-08-15T00:00:00.000Z');
      jest.useFakeTimers();
      jest.setSystemTime(lastSessionAt);
      mockUserService.getUserById.mockResolvedValue({ id: 7 });
      mockBookService.getBookById.mockResolvedValue(createSampleBook(BookLayoutType.REFLOWABLE));
      mockReadingProgressRepository.findByUserIdAndBookId.mockResolvedValue(null);
      mockReadingProgressRepository.create.mockResolvedValue(expectedProgress);
      const actualProgress = await readingProgressService.saveReadingProgress({
        userId: 7,
        bookId: 8,
        spineIndex: 1,
        scrollOffset: 120,
      });
      expect(mockReadingProgressRepository.create).toHaveBeenCalledWith({
        userId: 7,
        bookId: 8,
        layoutType: BookLayoutType.REFLOWABLE,
        spineIndex: 1,
        scrollOffset: 120,
        spreadIndex: null,
        pageNumber: null,
        lastSessionAt,
      });
      expect(actualProgress).toBe(expectedProgress);
    });

    it('updates existing fixed-layout progress from spread and page number', async () => {
      const existing = createSampleProgress();
      const expectedProgress = new ReadingProgressEntity({
        ...existing,
        layoutType: BookLayoutType.FIXED_LAYOUT,
        spineIndex: null,
        scrollOffset: null,
        spreadIndex: 2,
        pageNumber: 5,
      });
      mockUserService.getUserById.mockResolvedValue({ id: 7 });
      mockBookService.getBookById.mockResolvedValue(createSampleBook(BookLayoutType.FIXED_LAYOUT));
      mockReadingProgressRepository.findByUserIdAndBookId.mockResolvedValue(existing);
      mockReadingProgressRepository.update.mockResolvedValue(expectedProgress);
      const lastSessionAt = new Date('2026-08-15T01:00:00.000Z');
      const actualProgress = await readingProgressService.saveReadingProgress({
        userId: 7,
        bookId: 8,
        spreadIndex: 2,
        pageNumber: 5,
        lastSessionAt,
      });
      expect(mockReadingProgressRepository.update).toHaveBeenCalledWith({
        id: 3,
        layoutType: BookLayoutType.FIXED_LAYOUT,
        spineIndex: null,
        scrollOffset: null,
        spreadIndex: 2,
        pageNumber: 5,
        lastSessionAt,
      });
      expect(actualProgress).toBe(expectedProgress);
    });

    it('rejects reflowable fields on a fixed-layout book', async () => {
      mockUserService.getUserById.mockResolvedValue({ id: 7 });
      mockBookService.getBookById.mockResolvedValue(createSampleBook(BookLayoutType.FIXED_LAYOUT));
      await expect(
        readingProgressService.saveReadingProgress({
          userId: 7,
          bookId: 8,
          spineIndex: 1,
          scrollOffset: 120,
        }),
      ).rejects.toBeInstanceOf(ReadingProgressInvalidPositionException);
      expect(mockReadingProgressRepository.create).not.toHaveBeenCalled();
    });

    it('rejects progress when the book has no layout type', async () => {
      mockUserService.getUserById.mockResolvedValue({ id: 7 });
      mockBookService.getBookById.mockResolvedValue(createSampleBook(null));
      await expect(
        readingProgressService.saveReadingProgress({
          userId: 7,
          bookId: 8,
          spineIndex: 0,
          scrollOffset: 0,
        }),
      ).rejects.toBeInstanceOf(ReadingProgressBookLayoutUnknownException);
    });
  });

  describe('getReadingProgressByUserAndBook', () => {
    it('returns stored progress for the user and book', async () => {
      const expectedProgress = createSampleProgress();
      mockBookService.getBookById.mockResolvedValue(createSampleBook(BookLayoutType.REFLOWABLE));
      mockReadingProgressRepository.findByUserIdAndBookId.mockResolvedValue(expectedProgress);
      const actualProgress = await readingProgressService.getReadingProgressByUserAndBook({
        userId: 7,
        bookId: 8,
      });
      expect(mockBookService.getBookById).toHaveBeenCalledWith(8);
      expect(actualProgress).toBe(expectedProgress);
    });

    it('throws when progress is missing', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook(BookLayoutType.REFLOWABLE));
      mockReadingProgressRepository.findByUserIdAndBookId.mockResolvedValue(null);
      await expect(
        readingProgressService.getReadingProgressByUserAndBook({ userId: 7, bookId: 8 }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
    });

    it('throws when the book is missing', async () => {
      mockBookService.getBookById.mockRejectedValue(new ResourceNotFoundException('Book', 8));
      await expect(
        readingProgressService.getReadingProgressByUserAndBook({ userId: 7, bookId: 8 }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(mockReadingProgressRepository.findByUserIdAndBookId).not.toHaveBeenCalled();
    });
  });

  describe('listReadingProgresses', () => {
    it('lists the caller progress rows without pagination defaults', async () => {
      const expectedPage = { entities: [createSampleProgress()], total: 1 };
      mockReadingProgressRepository.list.mockResolvedValue(expectedPage);
      const actualPage = await readingProgressService.listReadingProgresses({
        userId: 7,
        updatedSince: new Date('2026-08-15T00:00:00.000Z'),
      });
      expect(mockReadingProgressRepository.list).toHaveBeenCalledWith({
        userId: 7,
        bookId: undefined,
        updatedSince: new Date('2026-08-15T00:00:00.000Z'),
      });
      expect(actualPage).toBe(expectedPage);
    });
  });
});
