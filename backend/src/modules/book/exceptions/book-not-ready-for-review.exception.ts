import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookNotReadyForReviewException extends InvalidStateException {
  constructor(bookId: number) {
    super({
      message: `Book ${bookId} is not ready to submit for review`,
      code: 'BOOK_NOT_READY_FOR_REVIEW',
    });
  }
}
