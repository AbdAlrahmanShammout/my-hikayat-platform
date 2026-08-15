import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { RevenuePeriodRangeInvalidException } from './revenue-period-range-invalid.exception';

describe('RevenuePeriodRangeInvalidException', () => {
  it('reports an invalid revenue period range', () => {
    const actualException = new RevenuePeriodRangeInvalidException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('REVENUE_PERIOD_RANGE_INVALID');
  });
});
