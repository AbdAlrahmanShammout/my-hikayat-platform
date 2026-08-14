import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookProcessingNotReflowableException extends InvalidStateException {
  constructor(bookId: number) {
    super({
      message: `Book ${bookId} is not a reflowable EPUB`,
      code: 'BOOK_PROCESSING_NOT_REFLOWABLE',
    });
  }
}
