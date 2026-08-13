import { AppException, type AppExceptionInput } from './app.exception';
import { ErrorKind } from './error-kind.enum';
import { ValidationErrorObject } from './validation-error-object.type';

export type ValidationExceptionsInput = AppExceptionInput & {
  readonly validationErrorObjects: ValidationErrorObject[];
};

export class ValidationExceptions extends AppException {
  readonly validationErrorObjects: ValidationErrorObject[];

  constructor(data: ValidationExceptionsInput) {
    super({
      message: data.message,
      code: data.code ?? 'BAD_USER_INPUT',
      kind: ErrorKind.VALIDATION,
      userFriendly: data.userFriendly ?? true,
    });
    this.validationErrorObjects = data.validationErrorObjects;
  }
}
