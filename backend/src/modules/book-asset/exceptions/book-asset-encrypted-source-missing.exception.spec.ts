import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookAssetEncryptedSourceMissingException } from './book-asset-encrypted-source-missing.exception';

describe('BookAssetEncryptedSourceMissingException', () => {
  it('reports a missing encrypted source for a catalog book', () => {
    const actualException = new BookAssetEncryptedSourceMissingException(8);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_ASSET_ENCRYPTED_SOURCE_MISSING');
  });
});
