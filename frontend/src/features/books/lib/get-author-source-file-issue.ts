import { AUTHOR_SOURCE_FILE_UPLOAD } from '@/config/author-source-file-upload';

export type AuthorSourceFileInput = {
  readonly name: string;
  readonly size: number;
};

/**
 * Client-only source-file checks. The API still rejects invalid uploads.
 */
export function getAuthorSourceFileIssue(file: AuthorSourceFileInput): string | undefined {
  if (file.size === 0) {
    return 'Source file must not be empty';
  }
  if (file.size > AUTHOR_SOURCE_FILE_UPLOAD.maxBytes) {
    return 'Source file exceeds the maximum allowed size';
  }
  if (!hasAllowedSourceExtension(file.name)) {
    return 'Source file must be an EPUB or PDF';
  }
  return undefined;
}

function hasAllowedSourceExtension(fileName: string): boolean {
  const normalizedName: string = fileName.trim().toLowerCase();
  return AUTHOR_SOURCE_FILE_UPLOAD.extensions.some((extension) =>
    normalizedName.endsWith(extension),
  );
}
