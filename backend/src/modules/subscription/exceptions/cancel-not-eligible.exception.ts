import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class CancelNotEligibleException extends InvalidStateException {
  constructor() {
    super({
      message: 'The subscription is not eligible for cancellation',
      code: 'CANCEL_NOT_ELIGIBLE',
    });
  }
}
