import { getOfflineManifest, upsertOfflineManifest } from '@/features/offline/lib/offline-manifest-storage';
import type { OfflineBookManifest } from '@/features/offline/types/offline-book-manifest';
import { createBookAssetContentKey } from '@/features/reader/api/create-content-key';
import { writeOfflineDek } from '@/storage/offline-dek-storage';

export type RefreshOfflineBookAuthorizationInput = {
  readonly bookId: number;
  readonly sessionId: number;
};

/**
 * Refreshes a downloaded package's DEK and signed lease after online entitlement succeeds.
 */
export async function refreshOfflineBookAuthorization(
  input: RefreshOfflineBookAuthorizationInput,
): Promise<boolean> {
  const manifest: OfflineBookManifest | null = await getOfflineManifest(input.bookId);
  if (manifest === null) {
    return false;
  }
  const contentKey = await createBookAssetContentKey({
    bookId: input.bookId,
    sessionId: input.sessionId,
  });
  if (contentKey.keyDelivery !== 'plain' || contentKey.bookAssetId !== manifest.bookAssetId) {
    return false;
  }
  await writeOfflineDek(input.bookId, manifest.bookAssetId, contentKey.key);
  await upsertOfflineManifest({
    ...manifest,
    offlineLease: contentKey.offlineLease,
  });
  return true;
}
