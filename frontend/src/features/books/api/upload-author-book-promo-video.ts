import { requestFormData } from '@/api/request-form-data';
import { AUTHOR_PROMO_VIDEO_UPLOAD } from '@/config/author-promo-video-upload';
import type { components } from '@/generated/author';

export type UploadAuthorBookPromoVideoInput = {
  readonly bookId: number;
  readonly file: File;
};

/**
 * Uploads an optional MP4 or WebM promo video. Storage is unencrypted on the API.
 */
export async function uploadAuthorBookPromoVideo(
  input: UploadAuthorBookPromoVideoInput,
): Promise<components['schemas']['BookAssetResponse']> {
  const body: FormData = new FormData();
  body.append(AUTHOR_PROMO_VIDEO_UPLOAD.fieldName, input.file);
  return requestFormData<components['schemas']['BookAssetResponse']>({
    path: `/author/books/${input.bookId}/promo-video`,
    method: 'POST',
    body,
  });
}
