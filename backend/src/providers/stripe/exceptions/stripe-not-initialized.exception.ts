import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class StripeNotInitializedException extends InvalidStateException {
  constructor() {
    super({
      message: 'Stripe manager has no event handlers registered',
      code: 'STRIPE_NOT_INITIALIZED',
    });
  }
}
