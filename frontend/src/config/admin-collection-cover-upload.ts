/**
 * Mirrors POST /admin/collections/:id/cover. The API remains authoritative.
 */
export const ADMIN_COLLECTION_COVER_UPLOAD = {
  fieldName: 'file',
  maxBytes: 10_485_760,
  extensions: ['.jpg', '.jpeg', '.png', '.webp'] as const,
} as const;
