import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';

export class TrialNotNeededException extends ResourceConflictException {
  constructor() {
    super({
      message: 'The user already has paid full-book reading access',
      code: 'TRIAL_NOT_NEEDED',
    });
  }
}
