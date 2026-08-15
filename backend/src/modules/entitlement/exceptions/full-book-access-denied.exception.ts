import { AppException } from '@/common/exceptions/app.exception';
import { ErrorKind } from '@/common/exceptions/error-kind.enum';

export class FullBookAccessDeniedException extends AppException {
  constructor() {
    super({
      message: 'A paid subscription is required to read or download full books',
      code: 'FULL_BOOK_ACCESS_DENIED',
      kind: ErrorKind.ACCESS_DENIED,
      userFriendly: true,
    });
  }
}
