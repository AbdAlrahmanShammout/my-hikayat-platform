import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class CheckoutReturnUrlInvalidException extends InvalidStateException {
  constructor() {
    super({
      message: 'Checkout return URL origin is not allowed',
      code: 'CHECKOUT_RETURN_URL_INVALID',
    });
  }
}
