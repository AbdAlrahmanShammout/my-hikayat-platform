import { BookAssetKind } from './general.enum';

describe('BookAsset domain enums', () => {
  it('mirrors the database asset kind literals', () => {
    expect(BookAssetKind.SOURCE).toBe('source');
    expect(BookAssetKind.PROCESSED).toBe('processed');
    expect(BookAssetKind.PREVIEW_IMAGE).toBe('preview_image');
    expect(BookAssetKind.PROMO_VIDEO).toBe('promo_video');
    expect(BookAssetKind.AUDIO).toBe('audio');
  });
});
