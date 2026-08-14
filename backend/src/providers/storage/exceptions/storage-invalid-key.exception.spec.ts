import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { StorageInvalidKeyException } from './storage-invalid-key.exception';

describe('StorageInvalidKeyException', () => {
  it('reports an invalid storage key without an HTTP status', () => {
    const actualException = new StorageInvalidKeyException('/secret');
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('STORAGE_INVALID_KEY');
    expect(actualException.userFriendly).toBe(true);
    expect(actualException.message).toContain('/secret');
    expect(actualException).not.toHaveProperty('statusCode');
  });
});
