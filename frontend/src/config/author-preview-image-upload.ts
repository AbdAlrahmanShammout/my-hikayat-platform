/**
 * Mirrors POST /author/books/:bookId/preview-image. The API remains authoritative.
 */
export const AUTHOR_PREVIEW_IMAGE_UPLOAD = {
  fieldName: 'file',
  maxBytes: 10_485_760,
  extensions: ['.jpg', '.jpeg', '.png', '.webp'] as const,
} as const;
