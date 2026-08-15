import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { RevenuePeriodStartsAtConflictException } from './revenue-period-starts-at-conflict.exception';

describe('RevenuePeriodStartsAtConflictException', () => {
  it('reports a startsAt conflict', () => {
    const inputStartsAt = new Date('2026-08-01T00:00:00.000Z');
    const actualException = new RevenuePeriodStartsAtConflictException(inputStartsAt);
    expect(actualException.kind).toBe(ErrorKind.CONFLICT);
    expect(actualException.code).toBe('REVENUE_PERIOD_STARTS_AT_CONFLICT');
  });
});
