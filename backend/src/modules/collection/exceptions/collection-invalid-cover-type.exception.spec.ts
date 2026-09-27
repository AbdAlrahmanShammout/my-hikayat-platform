import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { CollectionInvalidCoverTypeException } from './collection-invalid-cover-type.exception';

describe('CollectionInvalidCoverTypeException', () => {
  it('reports an invalid cover image type', () => {
    const actualException = new CollectionInvalidCoverTypeException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('COLLECTION_INVALID_COVER_TYPE');
  });
});
