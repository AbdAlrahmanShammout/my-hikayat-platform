import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookAssetNotEncryptedException } from './book-asset-not-encrypted.exception';

describe('BookAssetNotEncryptedException', () => {
  it('reports that a downloadable asset must remain encrypted', () => {
    const actualException = new BookAssetNotEncryptedException(9);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_ASSET_NOT_ENCRYPTED');
  });
});
