/**
 * Mirrors POST /author/books/:bookId/promo-video. The API remains authoritative.
 */
export const AUTHOR_PROMO_VIDEO_UPLOAD = {
  fieldName: 'file',
  maxBytes: 104_857_600,
  extensions: ['.mp4', '.webm'] as const,
} as const;
