import { ErrorKind } from '@/common/exceptions/error-kind.enum';
import { BookLayoutType } from '@/modules/book/enum/general.enum';

import { ReadingSessionInvalidPositionException } from './reading-session-invalid-position.exception';

describe('ReadingSessionInvalidPositionException', () => {
  it('rejects a position that does not match the book layout', () => {
    const actualException = new ReadingSessionInvalidPositionException(BookLayoutType.REFLOWABLE);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('READING_SESSION_INVALID_POSITION');
  });
});
