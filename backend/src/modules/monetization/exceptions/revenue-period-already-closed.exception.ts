import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class RevenuePeriodAlreadyClosedException extends InvalidStateException {
  constructor() {
    super({
      message: 'A closed revenue period cannot change its platform cut',
      code: 'REVENUE_PERIOD_ALREADY_CLOSED',
    });
  }
}
