import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class RevenuePeriodCalculationTooEarlyException extends InvalidStateException {
  constructor() {
    super({
      message: 'Revenue can be calculated 7 days after the period ends',
      code: 'REVENUE_PERIOD_CALCULATION_TOO_EARLY',
    });
  }
}
