import { releaseOfflineDownload } from '@/features/offline/api/offline-download-slot';
import { getOfflineManifest, removeOfflineManifestEntry } from '@/features/offline/lib/offline-manifest-storage';
import { deleteOfflineDek } from '@/storage/offline-dek-storage';
import {
  deleteOfflineFileIfExists,
  resolveOfflineCiphertextPath,
  resolveOfflineCoverPath,
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
  if (manifest.coverFileName !== null) {
    await deleteOfflineFileIfExists(resolveOfflineCoverPath(manifest.coverFileName));
  }
  await deleteOfflineDek(manifest.bookId, manifest.bookAssetId);
  await removeOfflineManifestEntry(bookId);
  await releaseOfflineDownload(bookId).catch(() => undefined);
}
