import { Injectable } from '@nestjs/common';

import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BOOK_PUBLISHING_TRANSITIONS } from '@/modules/book/book-publishing-transitions';
import { BookProcessingStatusService } from '@/modules/book/book-processing-status.service';
import { BookPublishingStatusService } from '@/modules/book/book-publishing-status.service';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookProcessingStatus, BookPublishingStatus } from '@/modules/book/enum/general.enum';
import { BookInvalidPublishingTransitionException } from '@/modules/book/exceptions/book-invalid-publishing-transition.exception';
import { BookNotReadyForReviewException } from '@/modules/book/exceptions/book-not-ready-for-review.exception';
import { BOOK_PROCESSING_JOB } from '@/modules/book-processing/book-processing-job.constant';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { SubmitBookForReviewServiceInput } from '@/modules/book-processing/defs/book-processing-service.defs';
import { UserRole } from '@/modules/user/enum/general.enum';
import { JobManagerService } from '@/providers/job/job-manager.service';

@Injectable()
export class BookProcessingOrchestrationService {
  constructor(
    private readonly bookService: BookService,
    private readonly bookProcessingStatusService: BookProcessingStatusService,
    private readonly bookPublishingStatusService: BookPublishingStatusService,
    private readonly bookProcessingService: BookProcessingService,
    private readonly jobManagerService: JobManagerService,
  ) {}

  async startProcessing(bookId: number): Promise<BookEntity> {
    await this.bookProcessingStatusService.transitionProcessingStatus({
      bookId,
      to: BookProcessingStatus.PROCESSING,
    });
    await this.jobManagerService.enqueue({
      name: BOOK_PROCESSING_JOB.processSource,
      payload: { bookId },
    });
    return this.bookService.getBookById(bookId);
  }

  async executeProcessing(bookId: number): Promise<void> {
    try {
      await this.bookProcessingService.processSource(bookId);
      await this.bookProcessingStatusService.transitionProcessingStatus({
        bookId,
        to: BookProcessingStatus.READY,
      });
    } catch {
      await this.bookProcessingStatusService.transitionProcessingStatus({
        bookId,
        to: BookProcessingStatus.FAILED,
      });
    }
  }

  async submitForReview(input: SubmitBookForReviewServiceInput): Promise<BookEntity> {
    const book: BookEntity = await this.bookService.getBookById(input.bookId);
    BookProcessingOrchestrationService.assertCanSubmit(book, input.actorId, input.actorRole);
    BookProcessingOrchestrationService.assertCanEnterReview(book.publishingStatus);
    const processed: BookEntity = await this.ensureReadyForReview(book);
    if (processed.processingStatus !== BookProcessingStatus.READY) {
      throw new BookNotReadyForReviewException(book.id);
    }
    return this.bookPublishingStatusService.transitionPublishingStatus({
      bookId: book.id,
      to: BookPublishingStatus.IN_REVIEW,
    });
  }

  private async ensureReadyForReview(book: BookEntity): Promise<BookEntity> {
    if (book.processingStatus === BookProcessingStatus.READY) {
      return book;
    }
    return this.startProcessing(book.id);
  }

  private static assertCanSubmit(book: BookEntity, actorId: number, actorRole: UserRole): void {
    if (book.ownerId === actorId || actorRole === UserRole.ADMIN) {
      return;
    }
    throw new ResourceNotFoundException('Book', book.id);
  }

  private static assertCanEnterReview(from: BookPublishingStatus): void {
    if (BOOK_PUBLISHING_TRANSITIONS[from].includes(BookPublishingStatus.IN_REVIEW)) {
      return;
    }
    throw new BookInvalidPublishingTransitionException(from, BookPublishingStatus.IN_REVIEW);
  }
}
