import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { RevenuePeriodAlreadyClosedException } from './revenue-period-already-closed.exception';

describe('RevenuePeriodAlreadyClosedException', () => {
  it('reports that a closed revenue period cannot change its platform cut', () => {
    const actualException = new RevenuePeriodAlreadyClosedException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('REVENUE_PERIOD_ALREADY_CLOSED');
  });
});
