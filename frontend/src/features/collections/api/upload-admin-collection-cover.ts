import { requestFormData } from '@/api/request-form-data';
import { ADMIN_COLLECTION_COVER_UPLOAD } from '@/config/admin-collection-cover-upload';
import type { components } from '@/generated/admin';

export type UploadAdminCollectionCoverInput = {
  readonly collectionId: number;
  readonly file: File;
};

/**
 * Uploads a JPEG, PNG, or WebP collection cover.
 */
export async function uploadAdminCollectionCover(
  input: UploadAdminCollectionCoverInput,
): Promise<components['schemas']['CollectionResponse']> {
  const body: FormData = new FormData();
  body.append(ADMIN_COLLECTION_COVER_UPLOAD.fieldName, input.file);
  return requestFormData<components['schemas']['CollectionResponse']>({
    path: `/admin/collections/${input.collectionId}/cover`,
    method: 'POST',
    body,
  });
}
