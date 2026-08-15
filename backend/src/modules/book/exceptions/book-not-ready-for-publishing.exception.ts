import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookNotReadyForPublishingException extends InvalidStateException {
  constructor(bookId: number) {
    super({
      message: `Book ${bookId} is not ready to publish`,
      code: 'BOOK_NOT_READY_FOR_PUBLISHING',
    });
  }
}
