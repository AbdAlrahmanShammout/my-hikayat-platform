import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { BookProcessingStatus } from '@/modules/book/enum/general.enum';

export class BookInvalidProcessingTransitionException extends InvalidStateException {
  constructor(from: BookProcessingStatus, to: BookProcessingStatus) {
    super({
      message: `Book processing cannot move from ${from} to ${to}`,
      code: 'BOOK_INVALID_PROCESSING_TRANSITION',
    });
  }
}
