import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class ReadingSessionAlreadyOpenException extends InvalidStateException {
  constructor(userId: number, bookId: number) {
    super({
      message: `User ${userId} already has an open reading session for book ${bookId}`,
      code: 'READING_SESSION_ALREADY_OPEN',
    });
  }
}
