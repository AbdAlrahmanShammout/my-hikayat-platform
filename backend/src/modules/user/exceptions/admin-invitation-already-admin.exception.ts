import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class AdminInvitationAlreadyAdminException extends InvalidStateException {
  constructor() {
    super({
      message: 'The email already belongs to an admin',
      code: 'ADMIN_INVITATION_ALREADY_ADMIN',
    });
  }
}
