import { ApiError } from '@/api/api-error';
import type { CatalogBook } from '@/features/catalog/api/get-catalog-book';
import { getCatalogBook } from '@/features/catalog/api/get-catalog-book';
import { openOfflineReadingShell } from '@/features/offline/lib/open-offline-reading-shell';
import { fetchConnectivitySnapshot } from '@/native/connectivity/net-info-adapter';
import {
  createBookAssetDeliveryGrant,
  type BookAssetDeliveryGrant,
} from '@/features/reader/api/create-delivery-grant';
import { getCurrentReadingSession } from '@/features/reader/api/get-current-reading-session';
import {
  startReadingSession,
  type ReadingSession,
} from '@/features/reader/api/start-reading-session';
import type { ReadingProgress } from '@/features/reader/api/get-reading-progress';
import { buildStartSessionBody } from '@/features/reader/lib/build-start-session-body';
import { findReadingProgress } from '@/features/reader/lib/find-reading-progress';
import {
  isBookLayoutType,
  resolveReaderEngine,
  type ReaderEngineKind,
} from '@/features/reader/lib/resolve-reader-engine';

export type OpenReadingShellResult = {
  readonly book: CatalogBook;
  readonly session: ReadingSession;
  readonly engine: ReaderEngineKind;
  readonly deliveryGrant: BookAssetDeliveryGrant | null;
  readonly isOfflinePackage?: boolean;
};

/**
 * Opens the reading shell: catalog book → Smart Resume → session → layout engine.
 * Uses NetInfo as the only Online / Offline source; opens a downloaded package when offline.
 */
export async function openReadingShell(bookId: number): Promise<OpenReadingShellResult> {
  const connectivity = await fetchConnectivitySnapshot();
  if (!connectivity.isOnline) {
    return openOfflineReadingShell(bookId);
  }
  return openOnlineReadingShell(bookId);
}

async function openOnlineReadingShell(bookId: number): Promise<OpenReadingShellResult> {
  const [book, progress]: readonly [CatalogBook, ReadingProgress | null] = await Promise.all([
    getCatalogBook(bookId),
    findReadingProgress(bookId),
  ]);
  if (!isBookLayoutType(book.layoutType)) {
    throw new ApiError({
      message: 'This book is not ready to open in a reader yet.',
      code: 'READER_LAYOUT_UNAVAILABLE',
      statusCode: 409,
    });
  }
  const engine = resolveReaderEngine(book.layoutType);
  if (engine === null) {
    throw new ApiError({
      message: 'This book is not ready to open in a reader yet.',
      code: 'READER_LAYOUT_UNAVAILABLE',
      statusCode: 409,
    });
  }
  const [session, deliveryGrant]: readonly [ReadingSession, BookAssetDeliveryGrant | null] =
    await Promise.all([
      startOrResumeSession({
        bookId,
        layoutType: book.layoutType,
        progress,
      }),
      tryCreateDeliveryGrant(bookId),
    ]);
  return { book, session, engine, deliveryGrant, isOfflinePackage: false };
}

async function startOrResumeSession(input: {
  readonly bookId: number;
  readonly layoutType: 'reflowable' | 'fixed_layout';
  readonly progress: ReadingProgress | null;
}): Promise<ReadingSession> {
  try {
    return await startReadingSession({
      bookId: input.bookId,
      body: buildStartSessionBody(input.layoutType, input.progress),
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && error.code === 'READING_SESSION_ALREADY_OPEN') {
      return getCurrentReadingSession(input.bookId);
    }
    throw error;
  }
}

async function tryCreateDeliveryGrant(bookId: number): Promise<BookAssetDeliveryGrant | null> {
  try {
    return await createBookAssetDeliveryGrant(bookId);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      if (error.code === 'FULL_BOOK_ACCESS_DENIED' || error.statusCode === 403) {
        throw error;
      }
      if (
        error.code === 'BOOK_ASSET_ENCRYPTED_SOURCE_MISSING' ||
        error.code === 'BOOK_ASSET_NOT_ENCRYPTED'
      ) {
        return null;
      }
    }
    throw error;
  }
}
