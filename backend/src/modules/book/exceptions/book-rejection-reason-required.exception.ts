import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookRejectionReasonRequiredException extends InvalidStateException {
  constructor() {
    super({
      message: 'A non-empty rejection reason is required',
      code: 'BOOK_REJECTION_REASON_REQUIRED',
    });
  }
}
