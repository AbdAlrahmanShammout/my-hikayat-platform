import { ErrorKind } from '@/common/exceptions/error-kind.enum';
import { BookPublishingStatus } from '@/modules/book/enum/general.enum';

import { BookInvalidPublishingTransitionException } from './book-invalid-publishing-transition.exception';

describe('BookInvalidPublishingTransitionException', () => {
  it('reports a forbidden publishing status change', () => {
    const actualException = new BookInvalidPublishingTransitionException(
      BookPublishingStatus.IN_REVIEW,
      BookPublishingStatus.IN_REVIEW,
    );
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_INVALID_PUBLISHING_TRANSITION');
  });
});
