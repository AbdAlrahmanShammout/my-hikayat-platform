import type { BookAssetDeliveryGrant } from '@/features/reader/api/create-delivery-grant';
import { tryLoadOfflinePlaintext } from '@/features/offline/lib/load-offline-plaintext';
import { downloadAndDecryptBookSource } from '@/features/reader/lib/download-and-decrypt-book-source';

export type LoadBookPlaintextInput = {
  readonly bookId: number;
  readonly sessionId: number;
  readonly deliveryGrant: BookAssetDeliveryGrant | null;
};

/**
 * Loads decrypted book bytes, preferring a downloaded offline package when present.
 */
export async function loadBookPlaintext(input: LoadBookPlaintextInput): Promise<Uint8Array> {
  const offlinePlaintext: Uint8Array | null = await tryLoadOfflinePlaintext(input.bookId);
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
