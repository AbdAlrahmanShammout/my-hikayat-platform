import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { StorageFailureException } from './storage-failure.exception';

describe('StorageFailureException', () => {
  it('reports a storage dependency failure without an HTTP status', () => {
    const actualException = new StorageFailureException();
    expect(actualException.kind).toBe(ErrorKind.DEPENDENCY_FAILURE);
    expect(actualException.code).toBe('STORAGE_FAILURE');
    expect(actualException.userFriendly).toBe(false);
    expect(actualException).not.toHaveProperty('statusCode');
  });
});
