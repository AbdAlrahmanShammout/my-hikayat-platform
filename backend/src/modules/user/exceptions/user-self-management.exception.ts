import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class UserSelfManagementException extends InvalidStateException {
  constructor() {
    super({
      message: 'An admin cannot change their own account through user management',
      code: 'USER_SELF_MANAGEMENT',
    });
  }
}
