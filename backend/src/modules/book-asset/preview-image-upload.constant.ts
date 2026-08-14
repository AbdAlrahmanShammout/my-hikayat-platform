export const PREVIEW_IMAGE_UPLOAD = {
  fieldName: 'file',
  maxBytes: 10_485_760,
  contentTypes: ['image/jpeg', 'image/png', 'image/webp'],
  extensions: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;
