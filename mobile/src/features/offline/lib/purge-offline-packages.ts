import { clearOfflineManifestDocument, listOfflineManifests } from '@/features/offline/lib/offline-manifest-storage';
import { clearOfflineProgressDocument } from '@/features/offline/lib/offline-progress-storage';
import { removeOfflineBook } from '@/features/offline/lib/remove-offline-book';

/**
 * Deletes every offline package, cached DEK, and local reading progress. Used on sign-out.
 */
export async function purgeOfflinePackages(): Promise<void> {
  const packages = await listOfflineManifests();
  for (const entry of packages) {
    await removeOfflineBook(entry.bookId);
  }
  await clearOfflineManifestDocument();
  await clearOfflineProgressDocument();
}
