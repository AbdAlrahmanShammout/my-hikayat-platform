import { Injectable } from '@nestjs/common';

import { BOOK_PUBLISHING_TRANSITIONS } from '@/modules/book/book-publishing-transitions';
import { BookService } from '@/modules/book/book.service';
import { TransitionBookPublishingStatusInput } from '@/modules/book/defs/book-service.defs';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookPublishingStatus } from '@/modules/book/enum/general.enum';
import { BookInvalidPublishingTransitionException } from '@/modules/book/exceptions/book-invalid-publishing-transition.exception';
import { BookRepository } from '@/modules/book/repository/book.repository';

@Injectable()
export class BookPublishingStatusService {
  constructor(
    private readonly bookService: BookService,
    private readonly bookRepository: BookRepository,
  ) {}

  async transitionPublishingStatus(
    input: TransitionBookPublishingStatusInput,
  ): Promise<BookEntity> {
    const book: BookEntity = await this.bookService.getBookById(input.bookId);
    BookPublishingStatusService.assertTransitionAllowed(book.publishingStatus, input.to);
    return this.bookRepository.update({
      id: book.id,
      publishingStatus: input.to,
    });
  }

  private static assertTransitionAllowed(
    from: BookPublishingStatus,
    to: BookPublishingStatus,
  ): void {
    if (BOOK_PUBLISHING_TRANSITIONS[from].includes(to)) {
      return;
    }
    throw new BookInvalidPublishingTransitionException(from, to);
  }
}
