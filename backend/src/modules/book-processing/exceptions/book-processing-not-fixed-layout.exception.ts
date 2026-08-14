import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookProcessingNotFixedLayoutException extends InvalidStateException {
  constructor(bookId: number) {
    super({
      message: `Book ${bookId} is not a fixed-layout EPUB`,
      code: 'BOOK_PROCESSING_NOT_FIXED_LAYOUT',
    });
  }
}
