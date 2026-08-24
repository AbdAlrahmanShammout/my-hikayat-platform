import type { BookAssetDeliveryGrant } from '@/features/reader/api/create-delivery-grant';
import type { BookAssetContentKey } from '@/features/reader/api/create-content-key';
import { createBookAssetContentKey } from '@/features/reader/api/create-content-key';
import {
  decodeContentKeyBase64,
  decryptContentWithDataKey,
  verifyCiphertextChecksum,
} from '@/features/reader/lib/decrypt-content-with-data-key';
import { parseEpubBook, type ParsedEpubBook } from '@/features/reader/lib/parse-epub-book';

export type LoadReflowableEpubInput = {
  readonly bookId: number;
  readonly sessionId: number;
  readonly deliveryGrant: BookAssetDeliveryGrant;
};

/**
 * Downloads encrypted EPUB, verifies checksum, decrypts in memory, and parses spine chapters.
 * Clears the DEK from local variables when finished (caller must not persist plaintext).
 */
export async function loadReflowableEpubBook(
  input: LoadReflowableEpubInput,
): Promise<ParsedEpubBook> {
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
    const plaintext: Uint8Array = decryptContentWithDataKey({
      ciphertext,
      dataKey,
    });
    return parseEpubBook(plaintext);
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
