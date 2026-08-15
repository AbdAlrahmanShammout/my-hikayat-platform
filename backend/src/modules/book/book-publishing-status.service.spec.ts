import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookInvalidPublishingTransitionException } from '@/modules/book/exceptions/book-invalid-publishing-transition.exception';
import { BookNotReadyForPublishingException } from '@/modules/book/exceptions/book-not-ready-for-publishing.exception';
import { BookRepository } from '@/modules/book/repository/book.repository';

import { BookPublishingStatusService } from './book-publishing-status.service';

function createSampleBook(
  publishingStatus = BookPublishingStatus.PENDING,
  processingStatus = BookProcessingStatus.READY,
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
    publishedAt: null,
    ownerId: 4,
  });
}

describe('BookPublishingStatusService', () => {
  let mockBookService: { getBookById: jest.Mock };
  let mockBookRepository: { update: jest.Mock };
  let bookPublishingStatusService: BookPublishingStatusService;

  beforeEach(() => {
    mockBookService = { getBookById: jest.fn() };
    mockBookRepository = { update: jest.fn() };
    bookPublishingStatusService = new BookPublishingStatusService(
      mockBookService as unknown as BookService,
      mockBookRepository as unknown as BookRepository,
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
    expect(mockBookRepository.update).toHaveBeenCalledWith({
      id: 8,
      publishingStatus: BookPublishingStatus.IN_REVIEW,
    });
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
      const actualBook = await bookPublishingStatusService.approveBook(8);
      expect(mockBookRepository.update).toHaveBeenCalledWith({
        id: 8,
        publishingStatus: BookPublishingStatus.APPROVED,
        publishedAt: expectedPublishedAt,
      });
      expect(actualBook).toBe(expectedBook);
    });

    it('rejects approving a book that is not processed', async () => {
      mockBookService.getBookById.mockResolvedValue(
        createSampleBook(BookPublishingStatus.IN_REVIEW, BookProcessingStatus.NOT_STARTED),
      );
      await expect(bookPublishingStatusService.approveBook(8)).rejects.toBeInstanceOf(
        BookNotReadyForPublishingException,
      );
      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });

    it('rejects approving a pending book', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      await expect(bookPublishingStatusService.approveBook(8)).rejects.toBeInstanceOf(
        BookInvalidPublishingTransitionException,
      );
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
      const actualBook = await bookPublishingStatusService.rejectBook(8);
      expect(mockBookRepository.update).toHaveBeenCalledWith({
        id: 8,
        publishingStatus: BookPublishingStatus.REJECTED,
      });
      expect(actualBook).toBe(expectedBook);
    });
  });
});
