import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookNotPublishedException } from './book-not-published.exception';

describe('BookNotPublishedException', () => {
  it('rejects an operation that requires a live catalog book', () => {
    const actualException = new BookNotPublishedException(8);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_NOT_PUBLISHED');
  });
});
