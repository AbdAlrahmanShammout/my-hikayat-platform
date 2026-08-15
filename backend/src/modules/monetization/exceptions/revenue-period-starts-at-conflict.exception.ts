import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';

export class RevenuePeriodStartsAtConflictException extends ResourceConflictException {
  constructor(startsAt: Date) {
    super({
      message: `A revenue period starting at ${startsAt.toISOString()} already exists`,
      code: 'REVENUE_PERIOD_STARTS_AT_CONFLICT',
    });
  }
}
