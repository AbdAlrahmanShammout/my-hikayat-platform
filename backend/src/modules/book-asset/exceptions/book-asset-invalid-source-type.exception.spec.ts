import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookAssetInvalidSourceTypeException } from './book-asset-invalid-source-type.exception';

describe('BookAssetInvalidSourceTypeException', () => {
  it('reports an unsupported source file type', () => {
    const actualException = new BookAssetInvalidSourceTypeException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_ASSET_INVALID_SOURCE_TYPE');
  });
});
