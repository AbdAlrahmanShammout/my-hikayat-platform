import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { ReadingSessionAlreadyEndedException } from './reading-session-already-ended.exception';

describe('ReadingSessionAlreadyEndedException', () => {
  it('rejects ending a session that already has an end time', () => {
    const actualException = new ReadingSessionAlreadyEndedException(9);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('READING_SESSION_ALREADY_ENDED');
  });
});
