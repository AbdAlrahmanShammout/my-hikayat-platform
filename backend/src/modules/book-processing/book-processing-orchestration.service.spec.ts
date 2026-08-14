import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookProcessingStatusService } from '@/modules/book/book-processing-status.service';
import { BookPublishingStatusService } from '@/modules/book/book-publishing-status.service';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookInvalidProcessingTransitionException } from '@/modules/book/exceptions/book-invalid-processing-transition.exception';
import { BookInvalidPublishingTransitionException } from '@/modules/book/exceptions/book-invalid-publishing-transition.exception';
import { BookNotReadyForReviewException } from '@/modules/book/exceptions/book-not-ready-for-review.exception';
import { BOOK_PROCESSING_JOB } from '@/modules/book-processing/book-processing-job.constant';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { UserRole } from '@/modules/user/enum/general.enum';
import { JobManagerService } from '@/providers/job/job-manager.service';

import { BookProcessingOrchestrationService } from './book-processing-orchestration.service';

type SampleBookOptions = {
  readonly processingStatus?: BookProcessingStatus;
  readonly publishingStatus?: BookPublishingStatus;
  readonly ownerId?: number;
};

function createSampleBook(options: SampleBookOptions = {}): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A processed book.',
    layoutType: BookLayoutType.REFLOWABLE,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: options.publishingStatus ?? BookPublishingStatus.PENDING,
    processingStatus: options.processingStatus ?? BookProcessingStatus.READY,
    publishedAt: null,
    ownerId: options.ownerId ?? 4,
    categories: [],
  });
}

describe('BookProcessingOrchestrationService', () => {
  let mockBookService: { getBookById: jest.Mock };
  let mockBookProcessingStatusService: { transitionProcessingStatus: jest.Mock };
  let mockBookPublishingStatusService: { transitionPublishingStatus: jest.Mock };
  let mockBookProcessingService: { processSource: jest.Mock };
  let mockJobManagerService: { enqueue: jest.Mock };
  let bookProcessingOrchestrationService: BookProcessingOrchestrationService;

  beforeEach(() => {
    mockBookService = { getBookById: jest.fn() };
    mockBookProcessingStatusService = { transitionProcessingStatus: jest.fn() };
    mockBookPublishingStatusService = { transitionPublishingStatus: jest.fn() };
    mockBookProcessingService = { processSource: jest.fn() };
    mockJobManagerService = { enqueue: jest.fn() };
    bookProcessingOrchestrationService = new BookProcessingOrchestrationService(
      mockBookService as unknown as BookService,
      mockBookProcessingStatusService as unknown as BookProcessingStatusService,
      mockBookPublishingStatusService as unknown as BookPublishingStatusService,
      mockBookProcessingService as unknown as BookProcessingService,
      mockJobManagerService as unknown as JobManagerService,
    );
  });

  describe('startProcessing', () => {
    it('moves the book to processing and enqueues the source job', async () => {
      const expectedBook = createSampleBook();
      mockBookProcessingStatusService.transitionProcessingStatus.mockResolvedValue(
        createSampleBook({ processingStatus: BookProcessingStatus.PROCESSING }),
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
        createSampleBook(),
      );
      await bookProcessingOrchestrationService.executeProcessing(8);
      expect(mockBookProcessingService.processSource).toHaveBeenCalledWith(8);
      expect(mockBookProcessingStatusService.transitionProcessingStatus).toHaveBeenCalledWith({
        bookId: 8,
        to: BookProcessingStatus.READY,
      });
    });

    it('marks the book failed when the source pipeline throws', async () => {
      mockBookProcessingService.processSource.mockRejectedValue(new Error('invalid source'));
      mockBookProcessingStatusService.transitionProcessingStatus.mockResolvedValue(
        createSampleBook({ processingStatus: BookProcessingStatus.FAILED }),
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

  describe('submitForReview', () => {
    const ownerInput = {
      bookId: 8,
      actorId: 4,
      actorRole: UserRole.AUTHOR,
    };

    it('submits a ready pending book without reprocessing', async () => {
      const expectedBook = createSampleBook({ publishingStatus: BookPublishingStatus.IN_REVIEW });
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockBookPublishingStatusService.transitionPublishingStatus.mockResolvedValue(expectedBook);
      const actualBook = await bookProcessingOrchestrationService.submitForReview(ownerInput);
      expect(mockJobManagerService.enqueue).not.toHaveBeenCalled();
      expect(mockBookPublishingStatusService.transitionPublishingStatus).toHaveBeenCalledWith({
        bookId: 8,
        to: BookPublishingStatus.IN_REVIEW,
      });
      expect(actualBook).toBe(expectedBook);
    });

    it('processes a pending book before moving it into review', async () => {
      const expectedBook = createSampleBook({ publishingStatus: BookPublishingStatus.IN_REVIEW });
      mockBookService.getBookById
        .mockResolvedValueOnce(
          createSampleBook({ processingStatus: BookProcessingStatus.NOT_STARTED }),
        )
        .mockResolvedValueOnce(createSampleBook());
      mockBookProcessingStatusService.transitionProcessingStatus.mockResolvedValue(
        createSampleBook({ processingStatus: BookProcessingStatus.PROCESSING }),
      );
      mockJobManagerService.enqueue.mockResolvedValue({
        jobId: 'job-1',
        name: BOOK_PROCESSING_JOB.processSource,
      });
      mockBookPublishingStatusService.transitionPublishingStatus.mockResolvedValue(expectedBook);
      const actualBook = await bookProcessingOrchestrationService.submitForReview(ownerInput);
      expect(mockJobManagerService.enqueue).toHaveBeenCalledWith({
        name: BOOK_PROCESSING_JOB.processSource,
        payload: { bookId: 8 },
      });
      expect(actualBook).toBe(expectedBook);
    });

    it('allows an admin to submit another owner book', async () => {
      const expectedBook = createSampleBook({ publishingStatus: BookPublishingStatus.IN_REVIEW });
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockBookPublishingStatusService.transitionPublishingStatus.mockResolvedValue(expectedBook);
      const actualBook = await bookProcessingOrchestrationService.submitForReview({
        bookId: 8,
        actorId: 99,
        actorRole: UserRole.ADMIN,
      });
      expect(actualBook).toBe(expectedBook);
    });

    it('hides a book from a non-owner author', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      await expect(
        bookProcessingOrchestrationService.submitForReview({
          bookId: 8,
          actorId: 99,
          actorRole: UserRole.AUTHOR,
        }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(mockJobManagerService.enqueue).not.toHaveBeenCalled();
      expect(mockBookPublishingStatusService.transitionPublishingStatus).not.toHaveBeenCalled();
    });

    it('rejects submitting a book that is already in review', async () => {
      mockBookService.getBookById.mockResolvedValue(
        createSampleBook({ publishingStatus: BookPublishingStatus.IN_REVIEW }),
      );
      await expect(
        bookProcessingOrchestrationService.submitForReview(ownerInput),
      ).rejects.toBeInstanceOf(BookInvalidPublishingTransitionException);
      expect(mockJobManagerService.enqueue).not.toHaveBeenCalled();
      expect(mockBookPublishingStatusService.transitionPublishingStatus).not.toHaveBeenCalled();
    });

    it('resubmits a rejected book that is already processed', async () => {
      const expectedBook = createSampleBook({ publishingStatus: BookPublishingStatus.IN_REVIEW });
      mockBookService.getBookById.mockResolvedValue(
        createSampleBook({ publishingStatus: BookPublishingStatus.REJECTED }),
      );
      mockBookPublishingStatusService.transitionPublishingStatus.mockResolvedValue(expectedBook);
      const actualBook = await bookProcessingOrchestrationService.submitForReview(ownerInput);
      expect(mockJobManagerService.enqueue).not.toHaveBeenCalled();
      expect(actualBook).toBe(expectedBook);
    });

    it('keeps publishing pending when processing fails', async () => {
      mockBookService.getBookById
        .mockResolvedValueOnce(
          createSampleBook({ processingStatus: BookProcessingStatus.NOT_STARTED }),
        )
        .mockResolvedValueOnce(createSampleBook({ processingStatus: BookProcessingStatus.FAILED }));
      mockBookProcessingStatusService.transitionProcessingStatus.mockResolvedValue(
        createSampleBook({ processingStatus: BookProcessingStatus.PROCESSING }),
      );
      mockJobManagerService.enqueue.mockResolvedValue({
        jobId: 'job-1',
        name: BOOK_PROCESSING_JOB.processSource,
      });
      await expect(
        bookProcessingOrchestrationService.submitForReview(ownerInput),
      ).rejects.toBeInstanceOf(BookNotReadyForReviewException);
      expect(mockBookPublishingStatusService.transitionPublishingStatus).not.toHaveBeenCalled();
    });
  });
});
