import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { ReadingSessionBookLayoutUnknownException } from './reading-session-book-layout-unknown.exception';

describe('ReadingSessionBookLayoutUnknownException', () => {
  it('rejects a session when the book has no layout type', () => {
    const actualException = new ReadingSessionBookLayoutUnknownException(8);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('READING_SESSION_BOOK_LAYOUT_UNKNOWN');
  });
});
