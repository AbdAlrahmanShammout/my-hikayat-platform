import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookAssetInvalidPreviewTypeException } from './book-asset-invalid-preview-type.exception';

describe('BookAssetInvalidPreviewTypeException', () => {
  it('reports an unsupported preview image type', () => {
    const actualException = new BookAssetInvalidPreviewTypeException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_ASSET_INVALID_PREVIEW_TYPE');
  });
});
