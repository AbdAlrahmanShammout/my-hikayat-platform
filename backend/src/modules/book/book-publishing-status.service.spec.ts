import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookAlreadyPublishedException } from '@/modules/book/exceptions/book-already-published.exception';
import { BookInvalidPublishingTransitionException } from '@/modules/book/exceptions/book-invalid-publishing-transition.exception';
import { BookNotPublishedException } from '@/modules/book/exceptions/book-not-published.exception';
import { BookNotReadyForPublishingException } from '@/modules/book/exceptions/book-not-ready-for-publishing.exception';
import { BookRepository } from '@/modules/book/repository/book.repository';

import { BookPublishingStatusService } from './book-publishing-status.service';

function createSampleBook(
  publishingStatus = BookPublishingStatus.PENDING,
  processingStatus = BookProcessingStatus.READY,
  publishedAt: Date | null = null,
): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A reflowable chapter book.',
    layoutType: null,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus,
    processingStatus,
    publishedAt,
    ownerId: 4,
  });
}

describe('BookPublishingStatusService', () => {
  let mockBookService: { getBookById: jest.Mock };
  let mockBookRepository: { update: jest.Mock };
  let mockAuditLogService: { append: jest.Mock };
  let mockTransactionRunner: { run: jest.Mock };
  let bookPublishingStatusService: BookPublishingStatusService;

  beforeEach(() => {
    mockBookService = { getBookById: jest.fn() };
    mockBookRepository = { update: jest.fn() };
    mockAuditLogService = { append: jest.fn() };
    mockTransactionRunner = {
      run: jest.fn(async (work: (context: undefined) => Promise<unknown>) => work(undefined)),
    };
    bookPublishingStatusService = new BookPublishingStatusService(
      mockBookService as unknown as BookService,
      mockBookRepository as unknown as BookRepository,
      mockAuditLogService as unknown as AuditLogService,
      mockTransactionRunner,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('moves pending to in_review', async () => {
    const expectedBook = createSampleBook(BookPublishingStatus.IN_REVIEW);
    mockBookService.getBookById.mockResolvedValue(createSampleBook());
    mockBookRepository.update.mockResolvedValue(expectedBook);
    const actualBook = await bookPublishingStatusService.transitionPublishingStatus({
      bookId: 8,
      to: BookPublishingStatus.IN_REVIEW,
    });
    expect(mockBookRepository.update).toHaveBeenCalledWith(
      {
        id: 8,
        publishingStatus: BookPublishingStatus.IN_REVIEW,
      },
      undefined,
    );
    expect(mockAuditLogService.append).not.toHaveBeenCalled();
    expect(actualBook).toBe(expectedBook);
  });

  it('rejects submitting an in-review book again', async () => {
    mockBookService.getBookById.mockResolvedValue(createSampleBook(BookPublishingStatus.IN_REVIEW));
    await expect(
      bookPublishingStatusService.transitionPublishingStatus({
        bookId: 8,
        to: BookPublishingStatus.IN_REVIEW,
      }),
    ).rejects.toBeInstanceOf(BookInvalidPublishingTransitionException);
    expect(mockBookRepository.update).not.toHaveBeenCalled();
  });

  it('throws when the book is missing', async () => {
    mockBookService.getBookById.mockRejectedValue(new ResourceNotFoundException('Book', 99));
    await expect(
      bookPublishingStatusService.transitionPublishingStatus({
        bookId: 99,
        to: BookPublishingStatus.IN_REVIEW,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
  });

  describe('approveBook', () => {
    it('approves an in-review ready book and sets publishedAt', async () => {
      const expectedPublishedAt = new Date('2026-08-15T00:00:00.000Z');
      jest.useFakeTimers();
      jest.setSystemTime(expectedPublishedAt);
      const expectedBook = createSampleBook(BookPublishingStatus.APPROVED);
      mockBookService.getBookById.mockResolvedValue(
        createSampleBook(BookPublishingStatus.IN_REVIEW),
      );
      mockBookRepository.update.mockResolvedValue(expectedBook);
      const actualBook = await bookPublishingStatusService.approveBook({
        bookId: 8,
        actorUserId: 9,
      });
      expect(mockBookRepository.update).toHaveBeenCalledWith(
        {
          id: 8,
          publishingStatus: BookPublishingStatus.APPROVED,
          publishedAt: expectedPublishedAt,
        },
        undefined,
      );
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        {
          actorUserId: 9,
          action: AuditAction.BOOK_APPROVED,
          subjectType: AuditSubjectType.BOOK,
          subjectId: 8,
          metadata: {
            from: BookPublishingStatus.IN_REVIEW,
            to: BookPublishingStatus.APPROVED,
          },
        },
        undefined,
      );
      expect(actualBook).toBe(expectedBook);
    });

    it('rejects approving a book that is not processed', async () => {
      mockBookService.getBookById.mockResolvedValue(
        createSampleBook(BookPublishingStatus.IN_REVIEW, BookProcessingStatus.NOT_STARTED),
      );
      await expect(
        bookPublishingStatusService.approveBook({ bookId: 8, actorUserId: 9 }),
      ).rejects.toBeInstanceOf(BookNotReadyForPublishingException);
      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });

    it('rejects approving a pending book', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      await expect(
        bookPublishingStatusService.approveBook({ bookId: 8, actorUserId: 9 }),
      ).rejects.toBeInstanceOf(BookInvalidPublishingTransitionException);
      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('rejectBook', () => {
    it('rejects an in-review book without setting publishedAt', async () => {
      const expectedBook = createSampleBook(BookPublishingStatus.REJECTED);
      mockBookService.getBookById.mockResolvedValue(
        createSampleBook(BookPublishingStatus.IN_REVIEW),
      );
      mockBookRepository.update.mockResolvedValue(expectedBook);
      const actualBook = await bookPublishingStatusService.rejectBook({
        bookId: 8,
        actorUserId: 9,
      });
      expect(mockBookRepository.update).toHaveBeenCalledWith(
        {
          id: 8,
          publishingStatus: BookPublishingStatus.REJECTED,
        },
        undefined,
      );
      expect(actualBook).toBe(expectedBook);
    });
  });

  describe('unpublishBook', () => {
    it('clears publishedAt while leaving the book approved', async () => {
      const publishedAt = new Date('2026-08-15T00:00:00.000Z');
      const current = createSampleBook(
        BookPublishingStatus.APPROVED,
        BookProcessingStatus.READY,
        publishedAt,
      );
      const expectedBook = createSampleBook(
        BookPublishingStatus.APPROVED,
        BookProcessingStatus.READY,
        null,
      );
      mockBookService.getBookById.mockResolvedValue(current);
      mockBookRepository.update.mockResolvedValue(expectedBook);
      const actualBook = await bookPublishingStatusService.unpublishBook({
        bookId: 8,
        actorUserId: 9,
      });
      expect(mockBookRepository.update).toHaveBeenCalledWith(
        {
          id: 8,
          publishedAt: null,
        },
        undefined,
      );
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        {
          actorUserId: 9,
          action: AuditAction.BOOK_UNPUBLISHED,
          subjectType: AuditSubjectType.BOOK,
          subjectId: 8,
          metadata: {
            publishingStatus: BookPublishingStatus.APPROVED,
          },
        },
        undefined,
      );
      expect(actualBook).toBe(expectedBook);
    });

    it('rejects unpublishing a book that is not live in the catalog', async () => {
      mockBookService.getBookById.mockResolvedValue(
        createSampleBook(BookPublishingStatus.APPROVED),
      );
      await expect(
        bookPublishingStatusService.unpublishBook({ bookId: 8, actorUserId: 9 }),
      ).rejects.toBeInstanceOf(BookNotPublishedException);
      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('republishBook', () => {
    it('sets publishedAt on an approved unpublished book', async () => {
      const expectedPublishedAt = new Date('2026-08-16T00:00:00.000Z');
      jest.useFakeTimers();
      jest.setSystemTime(expectedPublishedAt);
      const expectedBook = createSampleBook(
        BookPublishingStatus.APPROVED,
        BookProcessingStatus.READY,
        expectedPublishedAt,
      );
      mockBookService.getBookById.mockResolvedValue(
        createSampleBook(BookPublishingStatus.APPROVED),
      );
      mockBookRepository.update.mockResolvedValue(expectedBook);
      const actualBook = await bookPublishingStatusService.republishBook({
        bookId: 8,
        actorUserId: 9,
      });
      expect(mockBookRepository.update).toHaveBeenCalledWith(
        {
          id: 8,
          publishedAt: expectedPublishedAt,
        },
        undefined,
      );
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        {
          actorUserId: 9,
          action: AuditAction.BOOK_REPUBLISHED,
          subjectType: AuditSubjectType.BOOK,
          subjectId: 8,
          metadata: {
            publishingStatus: BookPublishingStatus.APPROVED,
          },
        },
        undefined,
      );
      expect(actualBook).toBe(expectedBook);
    });

    it('rejects republishing a book that is already live', async () => {
      mockBookService.getBookById.mockResolvedValue(
        createSampleBook(
          BookPublishingStatus.APPROVED,
          BookProcessingStatus.READY,
          new Date('2026-08-15T00:00:00.000Z'),
        ),
      );
      await expect(
        bookPublishingStatusService.republishBook({ bookId: 8, actorUserId: 9 }),
      ).rejects.toBeInstanceOf(BookAlreadyPublishedException);
      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });

    it('rejects republishing a book that is not approved', async () => {
      mockBookService.getBookById.mockResolvedValue(
        createSampleBook(BookPublishingStatus.REJECTED),
      );
      await expect(
        bookPublishingStatusService.republishBook({ bookId: 8, actorUserId: 9 }),
      ).rejects.toBeInstanceOf(BookNotPublishedException);
      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });
  });
});
