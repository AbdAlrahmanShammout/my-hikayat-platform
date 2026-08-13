import { AppException, type AppExceptionInput } from './app.exception';
import { ErrorKind } from './error-kind.enum';

export class InvalidStateException extends AppException {
  constructor(data: AppExceptionInput) {
    super({
      message: data.message,
      code: data.code ?? 'INVALID_STATE',
      kind: ErrorKind.INVALID_STATE,
      userFriendly: data.userFriendly ?? true,
    });
  }
}
