import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { RefundWindowExpiredException } from './refund-window-expired.exception';

describe('RefundWindowExpiredException', () => {
  it('rejects a refund after the activation window', () => {
    const actualException = new RefundWindowExpiredException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('REFUND_WINDOW_EXPIRED');
  });
});
