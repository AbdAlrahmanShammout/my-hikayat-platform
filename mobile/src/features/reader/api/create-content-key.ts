import { requestJson } from '@/api/client';
import type { OfflineReadingLease } from '@/features/offline/types/offline-book-manifest';

export type CreateBookAssetContentKeyRequest = {
  readonly sessionId: number;
};

export type BookAssetContentKey = {
  readonly bookId: number;
  readonly bookAssetId: number;
  readonly sessionId: number;
  readonly keyId: string;
  readonly algorithm: 'aes-256-gcm';
  readonly keyDelivery: 'plain';
  readonly key: string;
  readonly expiresAt: string;
  readonly offlineLease: OfflineReadingLease;
};

/**
 * Requests the per-asset content key for an open entitled reading session.
 */
export async function createBookAssetContentKey(input: {
  readonly bookId: number;
  readonly sessionId: number;
}): Promise<BookAssetContentKey> {
  return requestJson<BookAssetContentKey>({
    path: `/reader/books/${input.bookId}/content-key`,
    method: 'POST',
    body: { sessionId: input.sessionId } satisfies CreateBookAssetContentKeyRequest,
  });
}
