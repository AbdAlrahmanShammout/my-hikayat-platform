import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';

export class AdminInvitationNotResendableException extends ResourceConflictException {
  constructor() {
    super({
      message: 'Only a pending, unexpired invitation can be resent',
      code: 'ADMIN_INVITATION_NOT_RESENDABLE',
    });
  }
}
