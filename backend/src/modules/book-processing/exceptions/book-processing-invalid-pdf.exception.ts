import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookProcessingInvalidPdfException extends InvalidStateException {
  constructor(reason: string) {
    super({
      message: `PDF source is invalid: ${reason}`,
      code: 'BOOK_PROCESSING_INVALID_PDF',
    });
  }
}
