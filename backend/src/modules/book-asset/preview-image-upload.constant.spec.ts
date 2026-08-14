import { PREVIEW_IMAGE_UPLOAD } from './preview-image-upload.constant';

describe('PREVIEW_IMAGE_UPLOAD', () => {
  it('caps preview images at 10 MiB for the file field', () => {
    expect(PREVIEW_IMAGE_UPLOAD.fieldName).toBe('file');
    expect(PREVIEW_IMAGE_UPLOAD.maxBytes).toBe(10_485_760);
    expect(PREVIEW_IMAGE_UPLOAD.contentTypes).toEqual(['image/jpeg', 'image/png', 'image/webp']);
    expect(PREVIEW_IMAGE_UPLOAD.extensions).toEqual(['.jpg', '.jpeg', '.png', '.webp']);
  });
});
