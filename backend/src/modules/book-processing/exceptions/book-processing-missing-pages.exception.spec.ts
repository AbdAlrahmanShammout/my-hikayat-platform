import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookProcessingMissingPagesException } from './book-processing-missing-pages.exception';

describe('BookProcessingMissingPagesException', () => {
  it('rejects text extraction when pages have not been persisted', () => {
    const actualException = new BookProcessingMissingPagesException(8);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_PROCESSING_MISSING_PAGES');
  });
});
