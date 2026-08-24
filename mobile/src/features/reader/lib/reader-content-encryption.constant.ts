/**
 * Reader content encryption constants matching backend LIBENC01 envelopes.
 */
export const READER_CONTENT_ENCRYPTION = {
  magic: new TextEncoder().encode('LIBENC01'),
  contentVersion: 2,
  ivLength: 12,
  authTagLength: 16,
  dataKeyLength: 32,
  algorithm: 'aes-256-gcm',
} as const;
