import { DependencyFailureException } from '@/common/exceptions/dependency-failure.exception';

export class MailFailureException extends DependencyFailureException {
  constructor() {
    super({
      message: 'Mail request failed',
      code: 'MAIL_FAILURE',
    });
  }
}
