import { TooManyRequestsException } from '@/common/exceptions/too-many-requests.exception';

export class AdminInvitationResendCooldownException extends TooManyRequestsException {
  constructor(retryAfterSeconds: number) {
    super({
      message: 'Wait before resending this invitation',
      code: 'ADMIN_INVITATION_RESEND_COOLDOWN',
      retryAfterSeconds,
    });
  }
}
