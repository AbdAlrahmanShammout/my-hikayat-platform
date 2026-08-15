import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { FullBookAccessDeniedException } from './full-book-access-denied.exception';

describe('FullBookAccessDeniedException', () => {
  it('reports paid access is required', () => {
    const actualException = new FullBookAccessDeniedException();
    expect(actualException.kind).toBe(ErrorKind.ACCESS_DENIED);
    expect(actualException.code).toBe('FULL_BOOK_ACCESS_DENIED');
  });
});
