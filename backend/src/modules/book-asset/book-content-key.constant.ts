export const BOOK_CONTENT_KEY = {
  expiresInSeconds: 300,
  throttleTtlMs: 60_000,
  throttleLimit: 10,
  algorithm: 'aes-256-gcm' as const,
  keyDelivery: 'plain' as const,
} as const;
