import { BookAssetKind } from '@prisma/client';

describe('BookAsset Prisma model', () => {
  it('defines source, processed, catalog, and future audio kinds', () => {
    expect(BookAssetKind.source).toBe('source');
    expect(BookAssetKind.processed).toBe('processed');
    expect(BookAssetKind.preview_image).toBe('preview_image');
    expect(BookAssetKind.promo_video).toBe('promo_video');
    expect(BookAssetKind.audio).toBe('audio');
  });
});
