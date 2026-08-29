import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';

export class TrialAlreadyUsedException extends ResourceConflictException {
  constructor() {
    super({
      message: 'The free trial has already been used for this account',
      code: 'TRIAL_ALREADY_USED',
    });
  }
}
