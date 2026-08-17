import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class AdminInvitationExpiredException extends InvalidStateException {
  constructor() {
    super({
      message: 'The admin invitation has expired',
      code: 'ADMIN_INVITATION_EXPIRED',
    });
  }
}
