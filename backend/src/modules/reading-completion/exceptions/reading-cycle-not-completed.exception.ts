import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class ReadingCycleNotCompletedException extends InvalidStateException {
  constructor() {
    super({
      message: 'Start over is available only after the book is completed',
      code: 'READING_CYCLE_NOT_COMPLETED',
    });
  }
}
