import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookProcessingMissingSourceException extends InvalidStateException {
  constructor(bookId: number) {
    super({
      message: `Book ${bookId} has no source file to process`,
      code: 'BOOK_PROCESSING_MISSING_SOURCE',
    });
  }
}
