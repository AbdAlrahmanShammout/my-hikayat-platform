import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookAlreadyPublishedException extends InvalidStateException {
  constructor(bookId: number) {
    super({
      message: `Book ${bookId} is already published`,
      code: 'BOOK_ALREADY_PUBLISHED',
    });
  }
}
