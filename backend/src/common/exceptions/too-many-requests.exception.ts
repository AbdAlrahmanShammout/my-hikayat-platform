import { AppException, type AppExceptionInput } from '@/common/exceptions/app.exception';
import { ErrorKind } from '@/common/exceptions/error-kind.enum';

export type TooManyRequestsExceptionInput = AppExceptionInput & {
  readonly retryAfterSeconds: number;
};

export class TooManyRequestsException extends AppException {
  readonly retryAfterSeconds: number;

  constructor(data: TooManyRequestsExceptionInput) {
    super({
      message: data.message,
      code: data.code ?? 'TOO_MANY_REQUESTS',
      kind: ErrorKind.TOO_MANY_REQUESTS,
      userFriendly: data.userFriendly ?? true,
    });
    this.retryAfterSeconds = data.retryAfterSeconds;
  }
}
