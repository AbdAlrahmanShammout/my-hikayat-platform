import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class AdminInvitationAlreadyAcceptedException extends InvalidStateException {
  constructor() {
    super({
      message: 'The admin invitation has already been accepted',
      code: 'ADMIN_INVITATION_ALREADY_ACCEPTED',
    });
  }
}
