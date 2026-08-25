import { getOfflineManifest, removeOfflineManifestEntry } from '@/features/offline/lib/offline-manifest-storage';
import { deleteOfflineDek } from '@/storage/offline-dek-storage';
import {
  deleteOfflineFileIfExists,
  resolveOfflineCiphertextPath,
} from '@/storage/offline-file-storage';

/**
 * Removes one offline package: ciphertext file, cached DEK, and manifest entry.
 */
export async function removeOfflineBook(bookId: number): Promise<void> {
  const manifest = await getOfflineManifest(bookId);
  if (manifest === null) {
    return;
  }
  await deleteOfflineFileIfExists(resolveOfflineCiphertextPath(manifest.ciphertextFileName));
  await deleteOfflineDek(manifest.bookId, manifest.bookAssetId);
  await removeOfflineManifestEntry(bookId);
}
