import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';

export class SubscriptionAlreadyPaidException extends ResourceConflictException {
  constructor() {
    super({
      message: 'The user already has paid monthly access',
      code: 'SUBSCRIPTION_ALREADY_PAID',
    });
  }
}
