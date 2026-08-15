import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { RevenuePeriodPoolAmountMissingException } from './revenue-period-pool-amount-missing.exception';

describe('RevenuePeriodPoolAmountMissingException', () => {
  it('reports a missing revenue pool amount', () => {
    const actualException = new RevenuePeriodPoolAmountMissingException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('REVENUE_PERIOD_POOL_AMOUNT_MISSING');
  });
});
