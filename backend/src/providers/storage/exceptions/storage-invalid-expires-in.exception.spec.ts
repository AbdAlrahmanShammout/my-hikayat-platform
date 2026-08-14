import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { StorageInvalidExpiresInException } from './storage-invalid-expires-in.exception';

describe('StorageInvalidExpiresInException', () => {
  it('reports an invalid signed-URL expiry without an HTTP status', () => {
    const actualException = new StorageInvalidExpiresInException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('STORAGE_INVALID_EXPIRES_IN');
    expect(actualException.userFriendly).toBe(true);
    expect(actualException).not.toHaveProperty('statusCode');
  });
});
