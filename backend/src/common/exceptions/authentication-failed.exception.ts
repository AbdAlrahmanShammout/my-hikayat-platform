import { AppException } from './app.exception';
import { ErrorKind } from './error-kind.enum';

export class AuthenticationFailedException extends AppException {
  constructor() {
    super({
      message: 'Authentication failed',
      code: 'AUTHENTICATION_FAILED',
      kind: ErrorKind.UNAUTHENTICATED,
      userFriendly: true,
    });
  }
}
