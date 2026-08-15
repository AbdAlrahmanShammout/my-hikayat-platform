import { ErrorKind } from '@/common/exceptions/error-kind.enum';
import { BookLayoutType } from '@/modules/book/enum/general.enum';

import { ReadingProgressInvalidPositionException } from './reading-progress-invalid-position.exception';

describe('ReadingProgressInvalidPositionException', () => {
  it('rejects a position that does not match the book layout', () => {
    const actualException = new ReadingProgressInvalidPositionException(BookLayoutType.REFLOWABLE);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('READING_PROGRESS_INVALID_POSITION');
  });
});
