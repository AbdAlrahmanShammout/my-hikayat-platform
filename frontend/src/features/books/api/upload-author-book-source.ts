import { requestFormData } from '@/api/request-form-data';
import { AUTHOR_SOURCE_FILE_UPLOAD } from '@/config/author-source-file-upload';
import type { components } from '@/generated/author';

export type UploadAuthorBookSourceInput = {
  readonly bookId: number;
  readonly file: File;
};

/**
 * Uploads an EPUB or PDF source. Encryption is performed by the API.
 */
export async function uploadAuthorBookSource(
  input: UploadAuthorBookSourceInput,
): Promise<components['schemas']['BookAssetResponse']> {
  const body: FormData = new FormData();
  body.append(AUTHOR_SOURCE_FILE_UPLOAD.fieldName, input.file);
  return requestFormData<components['schemas']['BookAssetResponse']>({
    path: `/author/books/${input.bookId}/source`,
    method: 'POST',
    body,
  });
}
