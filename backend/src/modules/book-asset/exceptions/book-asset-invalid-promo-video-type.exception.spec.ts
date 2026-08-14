import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { BookAssetInvalidPromoVideoTypeException } from './book-asset-invalid-promo-video-type.exception';

describe('BookAssetInvalidPromoVideoTypeException', () => {
  it('reports an unsupported promo video type', () => {
    const actualException = new BookAssetInvalidPromoVideoTypeException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('BOOK_ASSET_INVALID_PROMO_VIDEO_TYPE');
  });
});
