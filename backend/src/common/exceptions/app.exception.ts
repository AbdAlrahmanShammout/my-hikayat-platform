import { ErrorKind } from './error-kind.enum';

export type AppExceptionInput = {
  readonly message: string;
  readonly code?: string;
  readonly kind?: ErrorKind;
  readonly userFriendly?: boolean;
};

export class AppException extends Error {
  readonly code: string;
  readonly kind: ErrorKind;
  readonly userFriendly: boolean;

  constructor(data: AppExceptionInput) {
    const {
      message,
      code = 'UNKNOWN_CODE',
      kind = ErrorKind.INTERNAL,
      userFriendly = false,
    } = data;
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.kind = kind;
    this.userFriendly = userFriendly;
  }
}
