import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class UserInvalidDisplayNameException extends InvalidStateException {
  constructor() {
    super({
      message: 'Display name must not be empty',
      code: 'USER_INVALID_DISPLAY_NAME',
    });
  }
}
