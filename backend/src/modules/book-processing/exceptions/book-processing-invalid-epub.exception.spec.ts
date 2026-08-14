import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookProcessingInvalidEpubException } from './book-processing-invalid-epub.exception';

describe('BookProcessingInvalidEpubException', () => {
  it('reports an invalid EPUB structure', () => {
    const actualException = new BookProcessingInvalidEpubException('mimetype is missing');
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_PROCESSING_INVALID_EPUB');
  });
});
