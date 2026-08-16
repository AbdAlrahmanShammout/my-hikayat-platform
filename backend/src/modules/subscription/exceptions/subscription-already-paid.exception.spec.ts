import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { SubscriptionAlreadyPaidException } from './subscription-already-paid.exception';

describe('SubscriptionAlreadyPaidException', () => {
  it('reports a paid monthly access conflict', () => {
    const actualException = new SubscriptionAlreadyPaidException();
    expect(actualException.kind).toBe(ErrorKind.CONFLICT);
    expect(actualException.code).toBe('SUBSCRIPTION_ALREADY_PAID');
  });
});
