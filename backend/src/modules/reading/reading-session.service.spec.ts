import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';
import { ReadingSessionAlreadyEndedException } from '@/modules/reading/exceptions/reading-session-already-ended.exception';
import { ReadingSessionAlreadyOpenException } from '@/modules/reading/exceptions/reading-session-already-open.exception';
import { ReadingSessionBookLayoutUnknownException } from '@/modules/reading/exceptions/reading-session-book-layout-unknown.exception';
import { ReadingSessionInvalidPositionException } from '@/modules/reading/exceptions/reading-session-invalid-position.exception';
import { ReadingSessionInvalidTimingException } from '@/modules/reading/exceptions/reading-session-invalid-timing.exception';
import { UserService } from '@/modules/user/user.service';

import { ReadingSessionService } from './reading-session.service';

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

function createOpenSession(): ReadingSessionEntity {
  return new ReadingSessionEntity({
    id: 9,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 7,
    bookId: 8,
    layoutType: BookLayoutType.REFLOWABLE,
    startedAt: new Date('2026-01-01T01:00:00.000Z'),
    endedAt: null,
    activeDurationMs: 0,
    idleDurationMs: 0,
    spineIndex: 1,
    scrollOffset: 120,
    spreadIndex: null,
    pageNumber: null,
  });
}

describe('ReadingSessionService', () => {
  let mockReadingSessionRepository: {
    create: jest.Mock;
    update: jest.Mock;
    findById: jest.Mock;
    findOpenByUserIdAndBookId: jest.Mock;
  };
  let mockBookService: { getBookById: jest.Mock };
  let mockUserService: { getUserById: jest.Mock };
  let readingSessionService: ReadingSessionService;

  beforeEach(() => {
    mockReadingSessionRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findOpenByUserIdAndBookId: jest.fn(),
    };
    mockBookService = { getBookById: jest.fn() };
    mockUserService = { getUserById: jest.fn() };
    readingSessionService = new ReadingSessionService(
      mockReadingSessionRepository,
      mockBookService as unknown as BookService,
      mockUserService as unknown as UserService,
    );
  });

  describe('startReadingSession', () => {
    it('creates an open reflowable session from spine index and scroll offset', async () => {
      const expectedSession = createOpenSession();
      const startedAt = new Date('2026-01-01T01:00:00.000Z');
      mockUserService.getUserById.mockResolvedValue({ id: 7 });
      mockBookService.getBookById.mockResolvedValue(createSampleBook(BookLayoutType.REFLOWABLE));
      mockReadingSessionRepository.findOpenByUserIdAndBookId.mockResolvedValue(null);
      mockReadingSessionRepository.create.mockResolvedValue(expectedSession);
      const actualSession = await readingSessionService.startReadingSession({
        userId: 7,
        bookId: 8,
        spineIndex: 1,
        scrollOffset: 120,
        startedAt,
      });
      expect(mockReadingSessionRepository.create).toHaveBeenCalledWith({
        userId: 7,
        bookId: 8,
        layoutType: BookLayoutType.REFLOWABLE,
        startedAt,
        endedAt: null,
        activeDurationMs: 0,
        idleDurationMs: 0,
        spineIndex: 1,
        scrollOffset: 120,
        spreadIndex: null,
        pageNumber: null,
      });
      expect(actualSession).toBe(expectedSession);
    });

    it('rejects a second open session for the same user and book', async () => {
      mockUserService.getUserById.mockResolvedValue({ id: 7 });
      mockBookService.getBookById.mockResolvedValue(createSampleBook(BookLayoutType.REFLOWABLE));
      mockReadingSessionRepository.findOpenByUserIdAndBookId.mockResolvedValue(createOpenSession());
      await expect(
        readingSessionService.startReadingSession({
          userId: 7,
          bookId: 8,
          spineIndex: 1,
          scrollOffset: 120,
        }),
      ).rejects.toBeInstanceOf(ReadingSessionAlreadyOpenException);
      expect(mockReadingSessionRepository.create).not.toHaveBeenCalled();
    });

    it('rejects reflowable fields on a fixed-layout book', async () => {
      mockUserService.getUserById.mockResolvedValue({ id: 7 });
      mockBookService.getBookById.mockResolvedValue(createSampleBook(BookLayoutType.FIXED_LAYOUT));
      await expect(
        readingSessionService.startReadingSession({
          userId: 7,
          bookId: 8,
          spineIndex: 1,
          scrollOffset: 120,
        }),
      ).rejects.toBeInstanceOf(ReadingSessionInvalidPositionException);
    });

    it('rejects a session when the book has no layout type', async () => {
      mockUserService.getUserById.mockResolvedValue({ id: 7 });
      mockBookService.getBookById.mockResolvedValue(createSampleBook(null));
      await expect(
        readingSessionService.startReadingSession({
          userId: 7,
          bookId: 8,
          spineIndex: 0,
          scrollOffset: 0,
        }),
      ).rejects.toBeInstanceOf(ReadingSessionBookLayoutUnknownException);
    });
  });

  describe('endReadingSession', () => {
    it('closes an open session with active and idle durations', async () => {
      const openSession = createOpenSession();
      const endedAt = new Date('2026-01-01T01:20:00.000Z');
      const expectedSession = new ReadingSessionEntity({
        ...openSession,
        endedAt,
        activeDurationMs: 900_000,
        idleDurationMs: 120_000,
        spineIndex: 2,
        scrollOffset: 400,
      });
      mockReadingSessionRepository.findById.mockResolvedValue(openSession);
      mockReadingSessionRepository.update.mockResolvedValue(expectedSession);
      const actualSession = await readingSessionService.endReadingSession({
        id: 9,
        userId: 7,
        bookId: 8,
        endedAt,
        activeDurationMs: 900_000,
        idleDurationMs: 120_000,
        spineIndex: 2,
        scrollOffset: 400,
      });
      expect(mockReadingSessionRepository.update).toHaveBeenCalledWith({
        id: 9,
        endedAt,
        activeDurationMs: 900_000,
        idleDurationMs: 120_000,
        spineIndex: 2,
        scrollOffset: 400,
        spreadIndex: null,
        pageNumber: null,
      });
      expect(actualSession).toBe(expectedSession);
    });

    it('rejects ending a session that already ended', async () => {
      mockReadingSessionRepository.findById.mockResolvedValue(
        new ReadingSessionEntity({
          ...createOpenSession(),
          endedAt: new Date('2026-01-01T01:20:00.000Z'),
        }),
      );
      await expect(
        readingSessionService.endReadingSession({
          id: 9,
          userId: 7,
          bookId: 8,
          activeDurationMs: 1,
          idleDurationMs: 0,
        }),
      ).rejects.toBeInstanceOf(ReadingSessionAlreadyEndedException);
    });

    it('hides another user session as not found', async () => {
      mockReadingSessionRepository.findById.mockResolvedValue(createOpenSession());
      await expect(
        readingSessionService.endReadingSession({
          id: 9,
          userId: 11,
          bookId: 8,
          activeDurationMs: 1,
          idleDurationMs: 0,
        }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(mockReadingSessionRepository.update).not.toHaveBeenCalled();
    });

    it('rejects an end time before the start time', async () => {
      mockReadingSessionRepository.findById.mockResolvedValue(createOpenSession());
      await expect(
        readingSessionService.endReadingSession({
          id: 9,
          userId: 7,
          bookId: 8,
          endedAt: new Date('2025-12-31T00:00:00.000Z'),
          activeDurationMs: 1,
          idleDurationMs: 0,
        }),
      ).rejects.toBeInstanceOf(ReadingSessionInvalidTimingException);
    });
  });

  describe('recordReadingSessionActivity', () => {
    it('adds active and idle intervals onto an open session', async () => {
      const openSession = createOpenSession();
      const expectedSession = new ReadingSessionEntity({
        ...openSession,
        activeDurationMs: 15_000,
        idleDurationMs: 3_000,
        spineIndex: 2,
        scrollOffset: 400,
      });
      mockReadingSessionRepository.findById.mockResolvedValue(openSession);
      mockReadingSessionRepository.update.mockResolvedValue(expectedSession);
      const actualSession = await readingSessionService.recordReadingSessionActivity({
        id: 9,
        userId: 7,
        bookId: 8,
        activeDurationMs: 15_000,
        idleDurationMs: 3_000,
        spineIndex: 2,
        scrollOffset: 400,
      });
      expect(mockReadingSessionRepository.update).toHaveBeenCalledWith({
        id: 9,
        activeDurationMs: 15_000,
        idleDurationMs: 3_000,
        spineIndex: 2,
        scrollOffset: 400,
        spreadIndex: null,
        pageNumber: null,
      });
      expect(actualSession).toBe(expectedSession);
    });
  });
});
