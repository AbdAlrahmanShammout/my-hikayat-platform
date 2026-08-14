import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookNotReadyForReviewException } from './book-not-ready-for-review.exception';

describe('BookNotReadyForReviewException', () => {
  it('rejects review submission when processing is not ready', () => {
    const actualException = new BookNotReadyForReviewException(8);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_NOT_READY_FOR_REVIEW');
  });
});
