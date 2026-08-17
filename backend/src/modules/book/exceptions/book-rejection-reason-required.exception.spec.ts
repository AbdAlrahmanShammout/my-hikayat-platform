import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookRejectionReasonRequiredException } from './book-rejection-reason-required.exception';

describe('BookRejectionReasonRequiredException', () => {
  it('rejects a missing or empty rejection reason', () => {
    const actualException = new BookRejectionReasonRequiredException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_REJECTION_REASON_REQUIRED');
  });
});
