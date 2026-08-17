import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class UserAdminInviteRequiredException extends InvalidStateException {
  constructor() {
    super({
      message: 'Admin role can only be granted by invitation',
      code: 'USER_ADMIN_INVITE_REQUIRED',
    });
  }
}
