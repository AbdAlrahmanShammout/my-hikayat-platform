import { ErrorKind } from '@/common/exceptions/error-kind.enum';
import { BookLayoutType } from '@/modules/book/enum/general.enum';

import { ReadingBookmarkInvalidPositionException } from './reading-bookmark-invalid-position.exception';

describe('ReadingBookmarkInvalidPositionException', () => {
  it('rejects a position that does not match the book layout', () => {
    const actualException = new ReadingBookmarkInvalidPositionException(BookLayoutType.REFLOWABLE);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('READING_BOOKMARK_INVALID_POSITION');
  });
});
