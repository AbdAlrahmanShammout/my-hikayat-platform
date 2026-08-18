import { AUTHOR_PREVIEW_IMAGE_UPLOAD } from '@/config/author-preview-image-upload';

export type AuthorPreviewFileInput = {
  readonly name: string;
  readonly size: number;
};

/**
 * Client-only preview-image checks. The API still rejects invalid uploads.
 */
export function getAuthorPreviewFileIssue(file: AuthorPreviewFileInput): string | undefined {
  if (file.size === 0) {
    return 'Preview image must not be empty';
  }
  if (file.size > AUTHOR_PREVIEW_IMAGE_UPLOAD.maxBytes) {
    return 'Preview image exceeds the maximum allowed size';
  }
  if (!hasAllowedPreviewExtension(file.name)) {
    return 'Preview image must be a JPEG, PNG, or WebP file';
  }
  return undefined;
}

function hasAllowedPreviewExtension(fileName: string): boolean {
  const normalizedName: string = fileName.trim().toLowerCase();
  return AUTHOR_PREVIEW_IMAGE_UPLOAD.extensions.some((extension) =>
    normalizedName.endsWith(extension),
  );
}
