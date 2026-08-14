import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { JobNotInitializedException } from './job-not-initialized.exception';

describe('JobNotInitializedException', () => {
  it('rejects enqueue before handlers are registered', () => {
    const actualException = new JobNotInitializedException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('JOB_NOT_INITIALIZED');
  });
});
