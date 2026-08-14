import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookProcessingMissingPagesException extends InvalidStateException {
  constructor(bookId: number) {
    super({
      message: `Book ${bookId} has no extracted pages to attach a text layer`,
      code: 'BOOK_PROCESSING_MISSING_PAGES',
    });
  }
}
