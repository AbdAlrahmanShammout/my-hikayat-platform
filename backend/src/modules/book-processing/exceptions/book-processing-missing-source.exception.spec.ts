import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookProcessingMissingSourceException } from './book-processing-missing-source.exception';

describe('BookProcessingMissingSourceException', () => {
  it('reports that the book has no source file', () => {
    const actualException = new BookProcessingMissingSourceException(8);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_PROCESSING_MISSING_SOURCE');
  });
});
