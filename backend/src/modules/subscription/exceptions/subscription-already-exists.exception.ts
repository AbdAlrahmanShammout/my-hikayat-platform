import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';

export class SubscriptionAlreadyExistsException extends ResourceConflictException {
  constructor(userId: number) {
    super({
      message: `User ${userId} already has a subscription`,
      code: 'SUBSCRIPTION_ALREADY_EXISTS',
    });
  }
}
