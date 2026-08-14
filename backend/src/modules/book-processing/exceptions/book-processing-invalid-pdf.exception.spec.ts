import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookProcessingInvalidPdfException } from './book-processing-invalid-pdf.exception';

describe('BookProcessingInvalidPdfException', () => {
  it('reports an invalid PDF source', () => {
    const actualException = new BookProcessingInvalidPdfException(
      'file does not start with a PDF header',
    );
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_PROCESSING_INVALID_PDF');
  });
});
