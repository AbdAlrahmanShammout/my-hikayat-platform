import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class UserLastAdminException extends InvalidStateException {
  constructor() {
    super({
      message: 'The last remaining admin cannot be demoted or deleted',
      code: 'USER_LAST_ADMIN',
    });
  }
}
