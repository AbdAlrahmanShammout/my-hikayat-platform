import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class RevenuePeriodPoolAmountInvalidException extends InvalidStateException {
  constructor() {
    super({
      message: 'Revenue pool amount must be a non-negative integer number of cents',
      code: 'REVENUE_PERIOD_POOL_AMOUNT_INVALID',
    });
  }
}
