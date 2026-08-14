import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { StorageObjectNotFoundException } from './storage-object-not-found.exception';

describe('StorageObjectNotFoundException', () => {
  it('reports a missing object without an HTTP status', () => {
    const actualException = new StorageObjectNotFoundException('books/8/source.epub');
    expect(actualException.kind).toBe(ErrorKind.NOT_FOUND);
    expect(actualException.code).toBe('STORAGE_OBJECT_NOT_FOUND');
    expect(actualException.userFriendly).toBe(true);
    expect(actualException.message).toContain('books/8/source.epub');
    expect(actualException).not.toHaveProperty('statusCode');
  });
});
