import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookInvalidProcessingTransitionException } from '@/modules/book/exceptions/book-invalid-processing-transition.exception';
import { BookRepository } from '@/modules/book/repository/book.repository';

import { BookProcessingStatusService } from './book-processing-status.service';

function createSampleBook(processingStatus = BookProcessingStatus.NOT_STARTED): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A reflowable chapter book.',
    layoutType: null,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.PENDING,
    processingStatus,
    publishedAt: null,
    ownerId: 4,
  });
}

describe('BookProcessingStatusService', () => {
  let mockBookService: { getBookById: jest.Mock };
  let mockBookRepository: { update: jest.Mock };
  let bookProcessingStatusService: BookProcessingStatusService;

  beforeEach(() => {
    mockBookService = { getBookById: jest.fn() };
    mockBookRepository = { update: jest.fn() };
    bookProcessingStatusService = new BookProcessingStatusService(
      mockBookService as unknown as BookService,
      mockBookRepository as unknown as BookRepository,
    );
  });

  describe('transitionProcessingStatus', () => {
    it('moves not_started to processing', async () => {
      const expectedBook = createSampleBook(BookProcessingStatus.PROCESSING);
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockBookRepository.update.mockResolvedValue(expectedBook);
      const actualBook = await bookProcessingStatusService.transitionProcessingStatus({
        bookId: 8,
        to: BookProcessingStatus.PROCESSING,
      });
      expect(mockBookRepository.update).toHaveBeenCalledWith({
        id: 8,
        processingStatus: BookProcessingStatus.PROCESSING,
      });
      expect(actualBook).toBe(expectedBook);
    });

    it('moves processing to ready', async () => {
      const expectedBook = createSampleBook(BookProcessingStatus.READY);
      mockBookService.getBookById.mockResolvedValue(
        createSampleBook(BookProcessingStatus.PROCESSING),
      );
      mockBookRepository.update.mockResolvedValue(expectedBook);
      const actualBook = await bookProcessingStatusService.transitionProcessingStatus({
        bookId: 8,
        to: BookProcessingStatus.READY,
      });
      expect(mockBookRepository.update).toHaveBeenCalledWith({
        id: 8,
        processingStatus: BookProcessingStatus.READY,
      });
      expect(actualBook).toBe(expectedBook);
    });

    it('rejects skipping from not_started to ready', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      await expect(
        bookProcessingStatusService.transitionProcessingStatus({
          bookId: 8,
          to: BookProcessingStatus.READY,
        }),
      ).rejects.toBeInstanceOf(BookInvalidProcessingTransitionException);
      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });

    it('throws when the book is missing', async () => {
      mockBookService.getBookById.mockRejectedValue(new ResourceNotFoundException('Book', 99));
      await expect(
        bookProcessingStatusService.transitionProcessingStatus({
          bookId: 99,
          to: BookProcessingStatus.PROCESSING,
        }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
    });
  });

  describe('resetProcessingStatus', () => {
    it('leaves an unprocessed book unchanged', async () => {
      const expectedBook = createSampleBook();
      mockBookService.getBookById.mockResolvedValue(expectedBook);
      const actualBook = await bookProcessingStatusService.resetProcessingStatus(8);
      expect(mockBookRepository.update).not.toHaveBeenCalled();
      expect(actualBook).toBe(expectedBook);
    });

    it('returns a ready book to not_started after a new source', async () => {
      const expectedBook = createSampleBook();
      mockBookService.getBookById
        .mockResolvedValueOnce(createSampleBook(BookProcessingStatus.READY))
        .mockResolvedValueOnce(createSampleBook(BookProcessingStatus.READY));
      mockBookRepository.update.mockResolvedValue(expectedBook);
      const actualBook = await bookProcessingStatusService.resetProcessingStatus(8);
      expect(mockBookRepository.update).toHaveBeenCalledWith({
        id: 8,
        processingStatus: BookProcessingStatus.NOT_STARTED,
      });
      expect(actualBook).toBe(expectedBook);
    });
  });
});
