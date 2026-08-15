import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { ReadingSessionAlreadyOpenException } from './reading-session-already-open.exception';

describe('ReadingSessionAlreadyOpenException', () => {
  it('rejects starting a second open session for the same user and book', () => {
    const actualException = new ReadingSessionAlreadyOpenException(7, 8);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('READING_SESSION_ALREADY_OPEN');
  });
});
