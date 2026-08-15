import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { StripeFailureException } from './stripe-failure.exception';

describe('StripeFailureException', () => {
  it('reports a Stripe dependency failure without an HTTP status', () => {
    const actualException = new StripeFailureException();
    expect(actualException.kind).toBe(ErrorKind.DEPENDENCY_FAILURE);
    expect(actualException.code).toBe('STRIPE_FAILURE');
    expect(actualException.userFriendly).toBe(false);
    expect(actualException).not.toHaveProperty('statusCode');
  });
});
