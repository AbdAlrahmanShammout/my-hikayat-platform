import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { ReadingProgressBookLayoutUnknownException } from './reading-progress-book-layout-unknown.exception';

describe('ReadingProgressBookLayoutUnknownException', () => {
  it('rejects progress when the book has no layout type', () => {
    const actualException = new ReadingProgressBookLayoutUnknownException(8);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('READING_PROGRESS_BOOK_LAYOUT_UNKNOWN');
  });
});
