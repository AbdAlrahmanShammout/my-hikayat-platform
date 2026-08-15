import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { ReadingBookmarkBookLayoutUnknownException } from './reading-bookmark-book-layout-unknown.exception';

describe('ReadingBookmarkBookLayoutUnknownException', () => {
  it('rejects a bookmark when the book has no layout type', () => {
    const actualException = new ReadingBookmarkBookLayoutUnknownException(8);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('READING_BOOKMARK_BOOK_LAYOUT_UNKNOWN');
  });
});
