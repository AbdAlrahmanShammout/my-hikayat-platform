import { Injectable } from '@nestjs/common';

import { BOOK_PROCESSING_TRANSITIONS } from '@/modules/book/book-processing-transitions';
import { BookService } from '@/modules/book/book.service';
import { TransitionBookProcessingStatusInput } from '@/modules/book/defs/book-service.defs';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookProcessingStatus } from '@/modules/book/enum/general.enum';
import { BookInvalidProcessingTransitionException } from '@/modules/book/exceptions/book-invalid-processing-transition.exception';
import { BookRepository } from '@/modules/book/repository/book.repository';

@Injectable()
export class BookProcessingStatusService {
  constructor(
    private readonly bookService: BookService,
    private readonly bookRepository: BookRepository,
  ) {}

  async transitionProcessingStatus(
    input: TransitionBookProcessingStatusInput,
  ): Promise<BookEntity> {
    const book: BookEntity = await this.bookService.getBookById(input.bookId);
    BookProcessingStatusService.assertTransitionAllowed(book.processingStatus, input.to);
    return this.bookRepository.update({
      id: book.id,
      processingStatus: input.to,
    });
  }

  async resetProcessingStatus(bookId: number): Promise<BookEntity> {
    const book: BookEntity = await this.bookService.getBookById(bookId);
    if (book.processingStatus === BookProcessingStatus.NOT_STARTED) {
      return book;
    }
    return this.transitionProcessingStatus({
      bookId,
      to: BookProcessingStatus.NOT_STARTED,
    });
  }

  private static assertTransitionAllowed(
    from: BookProcessingStatus,
    to: BookProcessingStatus,
  ): void {
    if (BOOK_PROCESSING_TRANSITIONS[from].includes(to)) {
      return;
    }
    throw new BookInvalidProcessingTransitionException(from, to);
  }
}
