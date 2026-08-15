import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { RefundNotEligibleException } from './refund-not-eligible.exception';

describe('RefundNotEligibleException', () => {
  it('rejects a refund when the subscription is not a paid monthly plan', () => {
    const actualException = new RefundNotEligibleException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('REFUND_NOT_ELIGIBLE');
  });
});
