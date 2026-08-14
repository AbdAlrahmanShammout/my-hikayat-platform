import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { EncryptionFailureException } from './encryption-failure.exception';

describe('EncryptionFailureException', () => {
  it('reports an encryption dependency failure without an HTTP status', () => {
    const actualException = new EncryptionFailureException();
    expect(actualException.kind).toBe(ErrorKind.DEPENDENCY_FAILURE);
    expect(actualException.code).toBe('ENCRYPTION_FAILURE');
    expect(actualException.userFriendly).toBe(false);
    expect(actualException).not.toHaveProperty('statusCode');
  });
});
