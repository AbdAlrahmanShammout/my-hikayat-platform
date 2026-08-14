import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookProcessingNotReflowableException } from './book-processing-not-reflowable.exception';

describe('BookProcessingNotReflowableException', () => {
  it('rejects chapter extraction for a fixed-layout book', () => {
    const actualException = new BookProcessingNotReflowableException(8);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_PROCESSING_NOT_REFLOWABLE');
  });
});
