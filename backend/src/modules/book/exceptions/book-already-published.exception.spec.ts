import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookAlreadyPublishedException } from './book-already-published.exception';

describe('BookAlreadyPublishedException', () => {
  it('rejects republishing a book that is already live', () => {
    const actualException = new BookAlreadyPublishedException(8);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_ALREADY_PUBLISHED');
  });
});
