export const PROMO_VIDEO_UPLOAD = {
  fieldName: 'file',
  maxBytes: 104_857_600,
  contentTypes: ['video/mp4', 'video/webm'],
  extensions: ['.mp4', '.webm'],
} as const;
