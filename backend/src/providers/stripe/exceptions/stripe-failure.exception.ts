import { DependencyFailureException } from '@/common/exceptions/dependency-failure.exception';

export class StripeFailureException extends DependencyFailureException {
  constructor() {
    super({
      message: 'Stripe request failed',
      code: 'STRIPE_FAILURE',
    });
  }
}
