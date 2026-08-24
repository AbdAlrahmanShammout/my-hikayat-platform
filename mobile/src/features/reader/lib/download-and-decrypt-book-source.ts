import type { BookAssetDeliveryGrant } from '@/features/reader/api/create-delivery-grant';
import type { BookAssetContentKey } from '@/features/reader/api/create-content-key';
import { createBookAssetContentKey } from '@/features/reader/api/create-content-key';
import {
  decodeContentKeyBase64,
  decryptContentWithDataKey,
  verifyCiphertextChecksum,
} from '@/features/reader/lib/decrypt-content-with-data-key';

export type DownloadAndDecryptBookSourceInput = {
  readonly bookId: number;
  readonly sessionId: number;
  readonly deliveryGrant: BookAssetDeliveryGrant;
};

/**
 * Downloads an encrypted source, verifies checksum, decrypts in memory, and zeros the DEK.
 */
export async function downloadAndDecryptBookSource(
  input: DownloadAndDecryptBookSourceInput,
): Promise<Uint8Array> {
  const ciphertext: Uint8Array = await downloadEncryptedBytes(input.deliveryGrant.url);
  verifyCiphertextChecksum(ciphertext, coerceChecksum(input.deliveryGrant.checksumSha256));
  const contentKeyResponse: BookAssetContentKey = await createBookAssetContentKey({
    bookId: input.bookId,
    sessionId: input.sessionId,
  });
  if (contentKeyResponse.keyDelivery !== 'plain') {
    throw new Error('This content key format is not supported yet.');
  }
  if (contentKeyResponse.algorithm !== 'aes-256-gcm') {
    throw new Error('This content encryption algorithm is not supported.');
  }
  let dataKey: Uint8Array | null = decodeContentKeyBase64(contentKeyResponse.key);
  try {
    return decryptContentWithDataKey({
      ciphertext,
      dataKey,
    });
  } finally {
    if (dataKey !== null) {
      dataKey.fill(0);
      dataKey = null;
    }
  }
}

async function downloadEncryptedBytes(url: string): Promise<Uint8Array> {
  const response: Response = await fetch(url, {
    method: 'GET',
    credentials: 'omit',
  });
  if (!response.ok) {
    throw new Error('Could not download the book file.');
  }
  const buffer: ArrayBuffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

function coerceChecksum(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  return value;
}
