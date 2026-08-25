import type { CatalogBook } from '@/features/catalog/api/get-catalog-book';
import { getCatalogBook } from '@/features/catalog/api/get-catalog-book';
import { buildOfflineCiphertextFileName } from '@/features/offline/lib/build-offline-ciphertext-file-name';
import { upsertOfflineManifest } from '@/features/offline/lib/offline-manifest-storage';
import type { OfflineBookManifest } from '@/features/offline/types/offline-book-manifest';
import { createBookAssetContentKey } from '@/features/reader/api/create-content-key';
import { createBookAssetDeliveryGrant } from '@/features/reader/api/create-delivery-grant';
import { endReadingSession } from '@/features/reader/api/end-reading-session';
import { startReadingSession } from '@/features/reader/api/start-reading-session';
import { buildStartSessionBody } from '@/features/reader/lib/build-start-session-body';
import { verifyCiphertextChecksum } from '@/features/reader/lib/decrypt-content-with-data-key';
import { isBookLayoutType } from '@/features/reader/lib/resolve-reader-engine';
import { writeOfflineDek } from '@/storage/offline-dek-storage';
import {
  deleteOfflineFileIfExists,
  downloadOfflineCiphertextFile,
  readOfflineCiphertextFile,
  resolveOfflineCiphertextPath,
} from '@/storage/offline-file-storage';

export type DownloadOfflineBookResult = {
  readonly manifest: OfflineBookManifest;
};

/**
 * Downloads encrypted ciphertext to disk and caches the DEK for offline reading.
 * Requires network, entitlement, and an openable layout type.
 */
export async function downloadOfflineBook(bookId: number): Promise<DownloadOfflineBookResult> {
  const book: CatalogBook = await getCatalogBook(bookId);
  if (!isBookLayoutType(book.layoutType)) {
    throw new Error('This book is not ready to download yet.');
  }
  const grant = await createBookAssetDeliveryGrant(bookId);
  const ciphertextFileName: string = buildOfflineCiphertextFileName(bookId, grant.bookAssetId);
  const ciphertextPath: string = resolveOfflineCiphertextPath(ciphertextFileName);
  await deleteOfflineFileIfExists(ciphertextPath);
  await downloadOfflineCiphertextFile({ url: grant.url, targetPath: ciphertextPath });
  const ciphertext: Uint8Array = await readOfflineCiphertextFile(ciphertextPath);
  verifyCiphertextChecksum(ciphertext, coerceChecksum(grant.checksumSha256));
  const session = await startReadingSession({
    bookId,
    body: buildStartSessionBody(book.layoutType),
  });
  try {
    const contentKey = await createBookAssetContentKey({
      bookId,
      sessionId: session.id,
    });
    if (contentKey.keyDelivery !== 'plain') {
      throw new Error('This content key format is not supported yet.');
    }
    await writeOfflineDek(bookId, grant.bookAssetId, contentKey.key);
    const manifest: OfflineBookManifest = {
      bookId,
      bookAssetId: grant.bookAssetId,
      title: book.title,
      description: book.description ?? '',
      layoutType: book.layoutType,
      checksumSha256: coerceChecksum(grant.checksumSha256),
      contentType: coerceNullableString(grant.contentType),
      byteSize: coerceNullablePositiveInt(grant.byteSize),
      ciphertextFileName,
      downloadedAt: new Date().toISOString(),
    };
    await upsertOfflineManifest(manifest);
    return { manifest };
  } finally {
    await endReadingSession({ bookId, sessionId: session.id }).catch(() => undefined);
  }
}

function coerceChecksum(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed: string = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function coerceNullableString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed: string = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function coerceNullablePositiveInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) {
    return null;
  }
  return Math.floor(value);
}
