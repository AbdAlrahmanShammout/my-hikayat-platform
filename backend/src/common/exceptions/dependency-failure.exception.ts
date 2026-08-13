import { AppException, type AppExceptionInput } from './app.exception';
import { ErrorKind } from './error-kind.enum';

export class DependencyFailureException extends AppException {
  constructor(data: AppExceptionInput) {
    super({
      message: data.message,
      code: data.code ?? 'DEPENDENCY_FAILURE',
      kind: ErrorKind.DEPENDENCY_FAILURE,
      userFriendly: data.userFriendly ?? false,
    });
  }
}
