import { AUTHOR_PROMO_VIDEO_UPLOAD } from '@/config/author-promo-video-upload';

export type AuthorPromoVideoFileInput = {
  readonly name: string;
  readonly size: number;
};

/**
 * Client-only promo-video checks. The API still rejects invalid uploads.
 */
export function getAuthorPromoVideoFileIssue(
  file: AuthorPromoVideoFileInput,
): string | undefined {
  if (file.size === 0) {
    return 'Promo video must not be empty';
  }
  if (file.size > AUTHOR_PROMO_VIDEO_UPLOAD.maxBytes) {
    return 'Promo video exceeds the maximum allowed size';
  }
  if (!hasAllowedPromoVideoExtension(file.name)) {
    return 'Promo video must be an MP4 or WebM file';
  }
  return undefined;
}

function hasAllowedPromoVideoExtension(fileName: string): boolean {
  const normalizedName: string = fileName.trim().toLowerCase();
  return AUTHOR_PROMO_VIDEO_UPLOAD.extensions.some((extension) =>
    normalizedName.endsWith(extension),
  );
}
