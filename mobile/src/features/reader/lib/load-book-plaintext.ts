import type { BookAssetDeliveryGrant } from '@/features/reader/api/create-delivery-grant';
import { tryLoadOfflinePlaintext } from '@/features/offline/lib/load-offline-plaintext';
import { refreshOfflineBookAuthorization } from '@/features/offline/lib/refresh-offline-book-authorization';
import { downloadAndDecryptBookSource } from '@/features/reader/lib/download-and-decrypt-book-source';
import { ApiError } from '@/api/api-error';

export type LoadBookPlaintextInput = {
  readonly bookId: number;
  readonly sessionId: number;
  readonly deliveryGrant: BookAssetDeliveryGrant | null;
};

/**
 * Loads decrypted book bytes, preferring a downloaded offline package when present.
 */
export async function loadBookPlaintext(input: LoadBookPlaintextInput): Promise<Uint8Array> {
  const offlinePlaintext: Uint8Array | null = await tryLoadOfflinePlaintextWithRefresh(input);
  if (offlinePlaintext !== null) {
    return offlinePlaintext;
  }
  if (input.deliveryGrant === null) {
    throw new Error(
      'This book is not downloaded for offline reading. Connect to the internet to open it.',
    );
  }
  return downloadAndDecryptBookSource({
    bookId: input.bookId,
    sessionId: input.sessionId,
    deliveryGrant: input.deliveryGrant,
  });
}

async function tryLoadOfflinePlaintextWithRefresh(
  input: LoadBookPlaintextInput,
): Promise<Uint8Array | null> {
  try {
    return await tryLoadOfflinePlaintext(input.bookId);
  } catch (error: unknown) {
    if (!canRefreshOfflineLease(error, input.deliveryGrant)) {
      throw error;
    }
  }
  const refreshed: boolean = await refreshOfflineBookAuthorization({
    bookId: input.bookId,
    sessionId: input.sessionId,
  });
  return refreshed ? tryLoadOfflinePlaintext(input.bookId) : null;
}

function canRefreshOfflineLease(
  error: unknown,
  deliveryGrant: BookAssetDeliveryGrant | null,
): boolean {
  return (
    deliveryGrant !== null &&
    error instanceof ApiError &&
    error.code === 'OFFLINE_LEASE_EXPIRED'
  );
}
