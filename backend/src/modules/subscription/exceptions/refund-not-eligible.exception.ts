import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class RefundNotEligibleException extends InvalidStateException {
  constructor() {
    super({
      message: 'The subscription is not eligible for a refund',
      code: 'REFUND_NOT_ELIGIBLE',
    });
  }
}
