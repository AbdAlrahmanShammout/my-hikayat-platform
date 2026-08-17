import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class AdminInvitationInvalidException extends InvalidStateException {
  constructor() {
    super({
      message: 'The admin invitation is not valid',
      code: 'ADMIN_INVITATION_INVALID',
    });
  }
}
