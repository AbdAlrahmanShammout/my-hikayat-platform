import { ApiError } from '@/api/api-error';
import { buildOfflineReadingSession } from '@/features/offline/lib/build-offline-reading-session';
import { manifestToCatalogBook } from '@/features/offline/lib/manifest-to-catalog-book';
import { getOfflineManifest } from '@/features/offline/lib/offline-manifest-storage';
import type { OpenReadingShellResult } from '@/features/reader/lib/open-reading-shell';
import {
  isBookLayoutType,
  resolveReaderEngine,
} from '@/features/reader/lib/resolve-reader-engine';

/**
 * Opens a downloaded book using local manifest metadata and an offline session stub.
 */
export async function openOfflineReadingShell(bookId: number): Promise<OpenReadingShellResult> {
  const manifest = await getOfflineManifest(bookId);
  if (manifest === null) {
    throw new ApiError({
      message: 'This book is not downloaded for offline reading.',
      code: 'OFFLINE_PACKAGE_MISSING',
      statusCode: 404,
    });
  }
  if (!isBookLayoutType(manifest.layoutType)) {
    throw new ApiError({
      message: 'This downloaded book is not ready to open yet.',
      code: 'READER_LAYOUT_UNAVAILABLE',
      statusCode: 409,
    });
  }
  const engine = resolveReaderEngine(manifest.layoutType);
  if (engine === null) {
    throw new ApiError({
      message: 'This downloaded book is not ready to open yet.',
      code: 'READER_LAYOUT_UNAVAILABLE',
      statusCode: 409,
    });
  }
  return {
    book: manifestToCatalogBook(manifest),
    session: buildOfflineReadingSession(manifest),
    engine,
    deliveryGrant: null,
    isOfflinePackage: true,
  };
}
