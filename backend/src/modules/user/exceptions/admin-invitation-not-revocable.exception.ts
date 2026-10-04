import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';

export class AdminInvitationNotRevocableException extends ResourceConflictException {
  constructor() {
    super({
      message: 'Only a pending invitation can be revoked',
      code: 'ADMIN_INVITATION_NOT_REVOKABLE',
    });
  }
}
