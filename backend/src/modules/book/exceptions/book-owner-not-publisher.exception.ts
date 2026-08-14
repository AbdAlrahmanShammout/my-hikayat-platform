import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookOwnerNotPublisherException extends InvalidStateException {
  constructor(ownerId: number) {
    super({
      message: `User ${ownerId} must have publisher capability to own a book`,
      code: 'BOOK_OWNER_NOT_PUBLISHER',
    });
  }
}
