import { AppException } from '@/common/exceptions/app.exception';
import { ErrorKind } from '@/common/exceptions/error-kind.enum';

export class JwtInvalidException extends AppException {
  constructor() {
    super({
      message: 'Token is invalid',
      code: 'JWT_INVALID',
      kind: ErrorKind.UNAUTHENTICATED,
      userFriendly: true,
    });
  }
}
