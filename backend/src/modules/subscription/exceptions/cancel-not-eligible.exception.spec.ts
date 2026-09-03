import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { CancelNotEligibleException } from './cancel-not-eligible.exception';

describe('CancelNotEligibleException', () => {
  it('rejects cancel when the subscription is not a paid monthly plan', () => {
    const actualException = new CancelNotEligibleException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('CANCEL_NOT_ELIGIBLE');
  });
});
