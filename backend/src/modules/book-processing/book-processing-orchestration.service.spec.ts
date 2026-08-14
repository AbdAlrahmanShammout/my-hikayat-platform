import { BookProcessingStatusService } from '@/modules/book/book-processing-status.service';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookInvalidProcessingTransitionException } from '@/modules/book/exceptions/book-invalid-processing-transition.exception';
import { BOOK_PROCESSING_JOB } from '@/modules/book-processing/book-processing-job.constant';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { BookProcessingInvalidEpubException } from '@/modules/book-processing/exceptions/book-processing-invalid-epub.exception';
import { JobManagerService } from '@/providers/job/job-manager.service';

import { BookProcessingOrchestrationService } from './book-processing-orchestration.service';

function createSampleBook(processingStatus: BookProcessingStatus): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A processed book.',
    layoutType: BookLayoutType.REFLOWABLE,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.PENDING,
    processingStatus,
    publishedAt: null,
    ownerId: 4,
    categories: [],
  });
}

describe('BookProcessingOrchestrationService', () => {
  let mockBookService: { getBookById: jest.Mock };
  let mockBookProcessingStatusService: { transitionProcessingStatus: jest.Mock };
  let mockBookProcessingService: { processSource: jest.Mock };
  let mockJobManagerService: { enqueue: jest.Mock };
  let bookProcessingOrchestrationService: BookProcessingOrchestrationService;

  beforeEach(() => {
    mockBookService = { getBookById: jest.fn() };
    mockBookProcessingStatusService = { transitionProcessingStatus: jest.fn() };
    mockBookProcessingService = { processSource: jest.fn() };
    mockJobManagerService = { enqueue: jest.fn() };
    bookProcessingOrchestrationService = new BookProcessingOrchestrationService(
      mockBookService as unknown as BookService,
      mockBookProcessingStatusService as unknown as BookProcessingStatusService,
      mockBookProcessingService as unknown as BookProcessingService,
      mockJobManagerService as unknown as JobManagerService,
    );
  });

  describe('startProcessing', () => {
    it('moves the book to processing and enqueues the source job', async () => {
      const expectedBook = createSampleBook(BookProcessingStatus.READY);
      mockBookProcessingStatusService.transitionProcessingStatus.mockResolvedValue(
        createSampleBook(BookProcessingStatus.PROCESSING),
      );
      mockJobManagerService.enqueue.mockResolvedValue({
        jobId: 'job-1',
        name: BOOK_PROCESSING_JOB.processSource,
      });
      mockBookService.getBookById.mockResolvedValue(expectedBook);
      const actualBook = await bookProcessingOrchestrationService.startProcessing(8);
      expect(mockBookProcessingStatusService.transitionProcessingStatus).toHaveBeenCalledWith({
        bookId: 8,
        to: BookProcessingStatus.PROCESSING,
      });
      expect(mockJobManagerService.enqueue).toHaveBeenCalledWith({
        name: BOOK_PROCESSING_JOB.processSource,
        payload: { bookId: 8 },
      });
      expect(actualBook).toBe(expectedBook);
    });

    it('rejects an illegal status transition before enqueueing', async () => {
      mockBookProcessingStatusService.transitionProcessingStatus.mockRejectedValue(
        new BookInvalidProcessingTransitionException(
          BookProcessingStatus.PROCESSING,
          BookProcessingStatus.PROCESSING,
        ),
      );
      await expect(bookProcessingOrchestrationService.startProcessing(8)).rejects.toBeInstanceOf(
        BookInvalidProcessingTransitionException,
      );
      expect(mockJobManagerService.enqueue).not.toHaveBeenCalled();
    });
  });

  describe('executeProcessing', () => {
    it('marks the book ready after the source pipeline succeeds', async () => {
      mockBookProcessingService.processSource.mockResolvedValue(undefined);
      mockBookProcessingStatusService.transitionProcessingStatus.mockResolvedValue(
        createSampleBook(BookProcessingStatus.READY),
      );
      await bookProcessingOrchestrationService.executeProcessing(8);
      expect(mockBookProcessingService.processSource).toHaveBeenCalledWith(8);
      expect(mockBookProcessingStatusService.transitionProcessingStatus).toHaveBeenCalledWith({
        bookId: 8,
        to: BookProcessingStatus.READY,
      });
    });

    it('marks the book failed when the source pipeline throws', async () => {
      mockBookProcessingService.processSource.mockRejectedValue(
        new BookProcessingInvalidEpubException('file is not a ZIP archive'),
      );
      mockBookProcessingStatusService.transitionProcessingStatus.mockResolvedValue(
        createSampleBook(BookProcessingStatus.FAILED),
      );
      await expect(
        bookProcessingOrchestrationService.executeProcessing(8),
      ).resolves.toBeUndefined();
      expect(mockBookProcessingStatusService.transitionProcessingStatus).toHaveBeenCalledWith({
        bookId: 8,
        to: BookProcessingStatus.FAILED,
      });
    });
  });
});
