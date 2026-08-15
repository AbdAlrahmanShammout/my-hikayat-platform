import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { SubscriptionAlreadyExistsException } from './subscription-already-exists.exception';

describe('SubscriptionAlreadyExistsException', () => {
  it('reports a per-user subscription conflict', () => {
    const actualException = new SubscriptionAlreadyExistsException(5);
    expect(actualException.kind).toBe(ErrorKind.CONFLICT);
    expect(actualException.code).toBe('SUBSCRIPTION_ALREADY_EXISTS');
  });
});
