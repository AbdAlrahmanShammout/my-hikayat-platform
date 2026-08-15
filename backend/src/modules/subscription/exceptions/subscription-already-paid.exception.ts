import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';

export class SubscriptionAlreadyPaidException extends ResourceConflictException {
  constructor() {
    super({
      message: 'The user already has an active monthly subscription',
      code: 'SUBSCRIPTION_ALREADY_PAID',
    });
  }
}
