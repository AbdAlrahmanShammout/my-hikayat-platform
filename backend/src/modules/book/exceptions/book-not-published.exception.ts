import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookNotPublishedException extends InvalidStateException {
  constructor(bookId: number) {
    super({
      message: `Book ${bookId} is not currently published`,
      code: 'BOOK_NOT_PUBLISHED',
    });
  }
}
