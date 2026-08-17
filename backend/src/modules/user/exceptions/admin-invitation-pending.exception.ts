import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';

export class AdminInvitationPendingException extends ResourceConflictException {
  constructor(email: string) {
    super({
      message: `A pending admin invitation already exists for ${email}`,
      code: 'ADMIN_INVITATION_PENDING',
    });
  }
}
