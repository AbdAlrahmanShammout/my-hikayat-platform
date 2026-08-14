import { Injectable } from '@nestjs/common';

import { BookProcessingStatusService } from '@/modules/book/book-processing-status.service';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookProcessingStatus } from '@/modules/book/enum/general.enum';
import { BOOK_PROCESSING_JOB } from '@/modules/book-processing/book-processing-job.constant';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { JobManagerService } from '@/providers/job/job-manager.service';

@Injectable()
export class BookProcessingOrchestrationService {
  constructor(
    private readonly bookService: BookService,
    private readonly bookProcessingStatusService: BookProcessingStatusService,
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
}
