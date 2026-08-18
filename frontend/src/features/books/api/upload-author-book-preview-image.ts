import { requestFormData } from '@/api/request-form-data';
import { AUTHOR_PREVIEW_IMAGE_UPLOAD } from '@/config/author-preview-image-upload';
import type { components } from '@/generated/author';

export type UploadAuthorBookPreviewImageInput = {
  readonly bookId: number;
  readonly file: File;
};

/**
 * Uploads a JPEG, PNG, or WebP preview image. Storage is unencrypted on the API.
 */
export async function uploadAuthorBookPreviewImage(
  input: UploadAuthorBookPreviewImageInput,
): Promise<components['schemas']['BookAssetResponse']> {
  const body: FormData = new FormData();
  body.append(AUTHOR_PREVIEW_IMAGE_UPLOAD.fieldName, input.file);
  return requestFormData<components['schemas']['BookAssetResponse']>({
    path: `/author/books/${input.bookId}/preview-image`,
    method: 'POST',
    body,
  });
}
