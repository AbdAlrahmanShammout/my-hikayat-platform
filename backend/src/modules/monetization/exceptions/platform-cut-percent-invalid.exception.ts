import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class PlatformCutPercentInvalidException extends InvalidStateException {
  constructor() {
    super({
      message: 'Platform cut percent must be a number from 0 through 100',
      code: 'PLATFORM_CUT_PERCENT_INVALID',
    });
  }
}
