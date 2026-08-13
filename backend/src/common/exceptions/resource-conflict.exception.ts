import { AppException, type AppExceptionInput } from './app.exception';
import { ErrorKind } from './error-kind.enum';

export class ResourceConflictException extends AppException {
  constructor(data: AppExceptionInput) {
    super({
      message: data.message,
      code: data.code ?? 'RESOURCE_CONFLICT',
      kind: ErrorKind.CONFLICT,
      userFriendly: data.userFriendly ?? true,
    });
  }
}
