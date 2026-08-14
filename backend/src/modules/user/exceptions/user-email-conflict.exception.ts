import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';

export class UserEmailConflictException extends ResourceConflictException {
  constructor(email: string) {
    super({
      message: `A user with email ${email} already exists`,
      code: 'USER_EMAIL_CONFLICT',
    });
  }
}
