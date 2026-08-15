import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class RevenuePeriodPoolAmountMissingException extends InvalidStateException {
  constructor() {
    super({
      message: 'Revenue period pool amount must be set before calculating author revenue',
      code: 'REVENUE_PERIOD_POOL_AMOUNT_MISSING',
    });
  }
}
