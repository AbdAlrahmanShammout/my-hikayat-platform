import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { ReadingSessionInvalidTimingException } from './reading-session-invalid-timing.exception';

describe('ReadingSessionInvalidTimingException', () => {
  it('rejects a session whose times or durations are invalid', () => {
    const actualException = new ReadingSessionInvalidTimingException(9);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('READING_SESSION_INVALID_TIMING');
  });
});
