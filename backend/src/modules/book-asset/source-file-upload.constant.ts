export const SOURCE_FILE_UPLOAD = {
  fieldName: 'file',
  maxBytes: 104_857_600,
  contentTypes: ['application/epub+zip', 'application/epub', 'application/pdf'],
  extensions: ['.epub', '.pdf'],
} as const;
