import { AppException } from '@/common/exceptions/app.exception';
import { ErrorKind } from '@/common/exceptions/error-kind.enum';

export class JwtExpiredException extends AppException {
  constructor() {
    super({
      message: 'Token has expired',
      code: 'JWT_EXPIRED',
      kind: ErrorKind.UNAUTHENTICATED,
      userFriendly: true,
    });
  }
}
