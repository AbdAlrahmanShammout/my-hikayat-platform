import { DependencyFailureException } from '@/common/exceptions/dependency-failure.exception';

export class StripeFailureException extends DependencyFailureException {
  constructor(message: string = 'Stripe request failed') {
    super({
      message,
      code: 'STRIPE_FAILURE',
    });
  }
}
