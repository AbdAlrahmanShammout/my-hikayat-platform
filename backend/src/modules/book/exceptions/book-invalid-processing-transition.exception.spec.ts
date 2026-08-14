import { ErrorKind } from '@/common/exceptions/error-kind.enum';
import { BookProcessingStatus } from '@/modules/book/enum/general.enum';

import { BookInvalidProcessingTransitionException } from './book-invalid-processing-transition.exception';

describe('BookInvalidProcessingTransitionException', () => {
  it('reports a forbidden processing status change', () => {
    const actualException = new BookInvalidProcessingTransitionException(
      BookProcessingStatus.NOT_STARTED,
      BookProcessingStatus.READY,
    );
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_INVALID_PROCESSING_TRANSITION');
  });
});
