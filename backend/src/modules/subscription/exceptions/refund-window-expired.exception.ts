import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class RefundWindowExpiredException extends InvalidStateException {
  constructor() {
    super({
      message: 'The 7-day refund window has expired',
      code: 'REFUND_WINDOW_EXPIRED',
    });
  }
}
