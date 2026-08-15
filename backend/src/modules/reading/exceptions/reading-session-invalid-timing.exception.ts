import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class ReadingSessionInvalidTimingException extends InvalidStateException {
  constructor(id: number) {
    super({
      message: `Reading session ${id} has invalid start, end, or duration values`,
      code: 'READING_SESSION_INVALID_TIMING',
    });
  }
}
