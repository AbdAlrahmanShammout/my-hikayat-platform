import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookProcessingNotFixedLayoutException } from './book-processing-not-fixed-layout.exception';

describe('BookProcessingNotFixedLayoutException', () => {
  it('rejects page extraction for a reflowable book', () => {
    const actualException = new BookProcessingNotFixedLayoutException(8);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_PROCESSING_NOT_FIXED_LAYOUT');
  });
});
