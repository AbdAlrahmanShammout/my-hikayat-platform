import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { StripeFailureException } from './stripe-failure.exception';

describe('StripeFailureException', () => {
  it('reports a Stripe dependency failure without an HTTP status', () => {
    const actualException = new StripeFailureException();
    expect(actualException.kind).toBe(ErrorKind.DEPENDENCY_FAILURE);
    expect(actualException.code).toBe('STRIPE_FAILURE');
    expect(actualException.message).toBe('Stripe request failed');
    expect(actualException.userFriendly).toBe(false);
    expect(actualException).not.toHaveProperty('statusCode');
  });

  it('preserves the underlying Stripe error message', () => {
    const actualException = new StripeFailureException("No such price: 'price_test'");
    expect(actualException.message).toBe("No such price: 'price_test'");
    expect(actualException.code).toBe('STRIPE_FAILURE');
  });
});
