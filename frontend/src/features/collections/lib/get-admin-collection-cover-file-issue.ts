import { ADMIN_COLLECTION_COVER_UPLOAD } from '@/config/admin-collection-cover-upload';

export type AdminCollectionCoverFileInput = {
  readonly name: string;
  readonly size: number;
};

/**
 * Client-only cover checks. The API still rejects invalid uploads.
 */
export function getAdminCollectionCoverFileIssue(
  file: AdminCollectionCoverFileInput,
): string | undefined {
  if (file.size === 0) {
    return 'Cover image must not be empty';
  }
  if (file.size > ADMIN_COLLECTION_COVER_UPLOAD.maxBytes) {
    return 'Cover image exceeds the maximum allowed size';
  }
  if (!hasAllowedCoverExtension(file.name)) {
    return 'Cover image must be a JPEG, PNG, or WebP file';
  }
  return undefined;
}

function hasAllowedCoverExtension(fileName: string): boolean {
  const normalizedName: string = fileName.trim().toLowerCase();
  return ADMIN_COLLECTION_COVER_UPLOAD.extensions.some((extension) =>
    normalizedName.endsWith(extension),
  );
}
