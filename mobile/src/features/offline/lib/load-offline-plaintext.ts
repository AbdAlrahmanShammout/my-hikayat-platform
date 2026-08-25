import { getOfflineManifest } from '@/features/offline/lib/offline-manifest-storage';
import {
  decodeContentKeyBase64,
  decryptContentWithDataKey,
  verifyCiphertextChecksum,
} from '@/features/reader/lib/decrypt-content-with-data-key';
import { readOfflineDek } from '@/storage/offline-dek-storage';
import {
  readOfflineCiphertextFile,
  resolveOfflineCiphertextPath,
} from '@/storage/offline-file-storage';

/**
 * Loads and decrypts a downloaded book package in memory. Returns null when no package exists.
 */
export async function tryLoadOfflinePlaintext(bookId: number): Promise<Uint8Array | null> {
  const manifest = await getOfflineManifest(bookId);
  if (manifest === null) {
    return null;
  }
  const dekBase64: string | null = await readOfflineDek(manifest.bookId, manifest.bookAssetId);
  if (dekBase64 === null || dekBase64.trim().length === 0) {
    return null;
  }
  const ciphertextPath: string = resolveOfflineCiphertextPath(manifest.ciphertextFileName);
  const ciphertext: Uint8Array = await readOfflineCiphertextFile(ciphertextPath);
  verifyCiphertextChecksum(ciphertext, manifest.checksumSha256);
  let dataKey: Uint8Array | null = decodeContentKeyBase64(dekBase64);
  try {
    return decryptContentWithDataKey({ ciphertext, dataKey });
  } finally {
    if (dataKey !== null) {
      dataKey.fill(0);
      dataKey = null;
    }
  }
}
