import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookProcessingInvalidSourceException } from './book-processing-invalid-source.exception';

describe('BookProcessingInvalidSourceException', () => {
  it('rejects a source that is neither EPUB nor PDF', () => {
    const actualException = new BookProcessingInvalidSourceException(
      'source file is not an EPUB or PDF',
    );
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_PROCESSING_INVALID_SOURCE');
  });
});
