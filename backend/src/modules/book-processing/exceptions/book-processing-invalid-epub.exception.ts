import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookProcessingInvalidEpubException extends InvalidStateException {
  constructor(reason: string) {
    super({
      message: `EPUB source is invalid: ${reason}`,
      code: 'BOOK_PROCESSING_INVALID_EPUB',
    });
  }
}
