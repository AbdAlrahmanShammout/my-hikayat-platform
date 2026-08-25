import { clearOfflineManifestDocument, listOfflineManifests } from '@/features/offline/lib/offline-manifest-storage';
import { removeOfflineBook } from '@/features/offline/lib/remove-offline-book';

/**
 * Deletes every offline package and cached DEK. Used on sign-out.
 */
export async function purgeOfflinePackages(): Promise<void> {
  const packages = await listOfflineManifests();
  for (const entry of packages) {
    await removeOfflineBook(entry.bookId);
  }
  await clearOfflineManifestDocument();
}
