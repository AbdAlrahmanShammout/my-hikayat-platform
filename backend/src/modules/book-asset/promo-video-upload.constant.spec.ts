import { PROMO_VIDEO_UPLOAD } from './promo-video-upload.constant';

describe('PROMO_VIDEO_UPLOAD', () => {
  it('caps promo videos at 100 MiB for the file field', () => {
    expect(PROMO_VIDEO_UPLOAD.fieldName).toBe('file');
    expect(PROMO_VIDEO_UPLOAD.maxBytes).toBe(104_857_600);
    expect(PROMO_VIDEO_UPLOAD.contentTypes).toEqual(['video/mp4', 'video/webm']);
    expect(PROMO_VIDEO_UPLOAD.extensions).toEqual(['.mp4', '.webm']);
  });
});
