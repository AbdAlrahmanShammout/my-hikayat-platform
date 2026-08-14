import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookOwnerNotPublisherException } from './book-owner-not-publisher.exception';

describe('BookOwnerNotPublisherException', () => {
  it('reports that the owner lacks publisher capability', () => {
    const actualException = new BookOwnerNotPublisherException(4);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_OWNER_NOT_PUBLISHER');
    expect(actualException.message).toContain('4');
  });
});
