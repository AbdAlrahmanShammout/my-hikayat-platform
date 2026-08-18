/**
 * Mirrors POST /author/books/:bookId/source. The API remains authoritative.
 */
export const AUTHOR_SOURCE_FILE_UPLOAD = {
  fieldName: 'file',
  maxBytes: 104_857_600,
  extensions: ['.epub', '.pdf'] as const,
} as const;
