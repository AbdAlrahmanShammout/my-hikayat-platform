import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { BookPublishingStatus } from '@/modules/book/enum/general.enum';

export class BookInvalidPublishingTransitionException extends InvalidStateException {
  constructor(from: BookPublishingStatus, to: BookPublishingStatus) {
    super({
      message: `Book publishing cannot move from ${from} to ${to}`,
      code: 'BOOK_INVALID_PUBLISHING_TRANSITION',
    });
  }
}
