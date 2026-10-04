import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class AdminInvitationRevokedException extends InvalidStateException {
  constructor() {
    super({
      message: 'The admin invitation has been revoked',
      code: 'ADMIN_INVITATION_REVOKED',
    });
  }
}
