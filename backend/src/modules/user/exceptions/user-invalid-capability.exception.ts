import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { UserRole } from '@/modules/user/enum/general.enum';

export class UserInvalidCapabilityException extends InvalidStateException {
  constructor(role: UserRole, isPublisher: boolean) {
    super({
      message: `Role ${role} is incompatible with publisher=${isPublisher}`,
      code: 'USER_INVALID_CAPABILITY',
    });
  }
}
