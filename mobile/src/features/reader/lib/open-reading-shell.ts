import { ApiError } from '@/api/api-error';
import type { CatalogBook } from '@/features/catalog/api/get-catalog-book';
import { getCatalogBook } from '@/features/catalog/api/get-catalog-book';
import {
  createBookAssetDeliveryGrant,
  type BookAssetDeliveryGrant,
} from '@/features/reader/api/create-delivery-grant';
import { getCurrentReadingSession } from '@/features/reader/api/get-current-reading-session';
import {
  startReadingSession,
  type ReadingSession,
} from '@/features/reader/api/start-reading-session';
import { buildStartSessionBody } from '@/features/reader/lib/build-start-session-body';
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
};

/**
 * Opens the reading shell: catalog book → session → layout engine.
 * Delivery grant is best-effort for later engines; missing source is not entitlement.
 */
export async function openReadingShell(bookId: number): Promise<OpenReadingShellResult> {
  const book: CatalogBook = await getCatalogBook(bookId);
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
  const session: ReadingSession = await startOrResumeSession(bookId, book.layoutType);
  const deliveryGrant: BookAssetDeliveryGrant | null = await tryCreateDeliveryGrant(bookId);
  return { book, session, engine, deliveryGrant };
}

async function startOrResumeSession(
  bookId: number,
  layoutType: 'reflowable' | 'fixed_layout',
): Promise<ReadingSession> {
  try {
    return await startReadingSession({
      bookId,
      body: buildStartSessionBody(layoutType),
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && error.code === 'READING_SESSION_ALREADY_OPEN') {
      return getCurrentReadingSession(bookId);
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
