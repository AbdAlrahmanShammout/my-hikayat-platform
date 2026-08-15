import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class RevenuePeriodRangeInvalidException extends InvalidStateException {
  constructor() {
    super({
      message: 'Revenue period endsAt must be later than startsAt',
      code: 'REVENUE_PERIOD_RANGE_INVALID',
    });
  }
}
