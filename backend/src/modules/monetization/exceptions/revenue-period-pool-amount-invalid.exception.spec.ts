import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { RevenuePeriodPoolAmountInvalidException } from './revenue-period-pool-amount-invalid.exception';

describe('RevenuePeriodPoolAmountInvalidException', () => {
  it('reports an invalid revenue pool amount', () => {
    const actualException = new RevenuePeriodPoolAmountInvalidException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('REVENUE_PERIOD_POOL_AMOUNT_INVALID');
  });
});
