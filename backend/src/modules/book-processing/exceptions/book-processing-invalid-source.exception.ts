import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookProcessingInvalidSourceException extends InvalidStateException {
  constructor(reason: string) {
    super({
      message: `Book source is invalid: ${reason}`,
      code: 'BOOK_PROCESSING_INVALID_SOURCE',
    });
  }
}
