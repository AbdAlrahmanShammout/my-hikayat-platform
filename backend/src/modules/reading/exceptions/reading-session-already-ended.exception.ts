import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class ReadingSessionAlreadyEndedException extends InvalidStateException {
  constructor(id: number) {
    super({
      message: `Reading session ${id} has already ended`,
      code: 'READING_SESSION_ALREADY_ENDED',
    });
  }
}
