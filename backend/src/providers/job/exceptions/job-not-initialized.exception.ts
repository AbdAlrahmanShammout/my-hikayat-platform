import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class JobNotInitializedException extends InvalidStateException {
  constructor() {
    super({
      message: 'Job manager has no event handlers registered',
      code: 'JOB_NOT_INITIALIZED',
    });
  }
}
