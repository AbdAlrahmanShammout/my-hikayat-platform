import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { CheckoutReturnUrlInvalidException } from './checkout-return-url-invalid.exception';

describe('CheckoutReturnUrlInvalidException', () => {
  it('rejects a checkout return URL outside the allowed origins', () => {
    const actualException = new CheckoutReturnUrlInvalidException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('CHECKOUT_RETURN_URL_INVALID');
  });
});
