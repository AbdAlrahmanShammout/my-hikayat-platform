import { AppException } from './app.exception';
import { ErrorKind } from './error-kind.enum';

export class AccessDeniedException extends AppException {
  constructor(message: string) {
    super({
      message,
      code: 'ACCESS_DENIED',
      kind: ErrorKind.ACCESS_DENIED,
      userFriendly: true,
    });
  }
}
