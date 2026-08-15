import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookNotReadyForPublishingException } from './book-not-ready-for-publishing.exception';

describe('BookNotReadyForPublishingException', () => {
  it('rejects publishing when processing is not ready', () => {
    const actualException = new BookNotReadyForPublishingException(8);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_NOT_READY_FOR_PUBLISHING');
  });
});
