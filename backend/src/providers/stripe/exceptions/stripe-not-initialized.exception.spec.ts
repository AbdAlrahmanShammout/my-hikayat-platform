import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { StripeNotInitializedException } from './stripe-not-initialized.exception';

describe('StripeNotInitializedException', () => {
  it('rejects webhook processing before handlers are registered', () => {
    const actualException = new StripeNotInitializedException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('STRIPE_NOT_INITIALIZED');
  });
});
